import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, realpathSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

// Local workflow checks, not a security boundary or proof of human identity.
const [action, ...args] = process.argv.slice(2);
const role = action === 'apply' ? args.shift() : undefined;
const change = args.shift();
const idle = args.length === 1 && args[0] === '--idle';
const root = process.cwd();
const env = { ...process.env, OPENSPEC_TELEMETRY: '0' };

function run(command, argv, capture = false) {
  const result = spawnSync(command, argv, {
    cwd: root, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${argv.join(' ')} falló (${result.status ?? result.signal}). ${result.stderr ?? ''}`);
  }
  return result.stdout?.trim() ?? '';
}

function inside(path) {
  const rel = relative(root, realpathSync(path));
  if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(root, rel) !== realpathSync(path)) {
    throw new Error('El change debe estar dentro de este checkout.');
  }
  return path;
}

function filesBelow(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const next = inside(resolve(path, entry.name));
    if (entry.isSymbolicLink()) throw new Error('No se admiten symlinks en el plan.');
    return entry.isDirectory() ? filesBelow(next) : [next];
  }).sort();
}

function planFiles(dir) {
  return ['.openspec.yaml', 'proposal.md', 'design.md', 'tasks.md']
    .map((name) => inside(resolve(dir, name)))
    .concat(filesBelow(inside(resolve(dir, 'specs'))));
}

function planHash(dir) {
  const hash = createHash('sha256');
  for (const file of planFiles(dir)) {
    let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    if (file === resolve(dir, 'tasks.md')) {
      content = content.replace(/^(\s*-\s+)\[[ xX]\]/gm, '$1[ ]');
    }
    hash.update(relative(dir, file)).update('\0').update(content).update('\0');
  }
  return hash.digest('hex');
}

function ready(dir) {
  const context = JSON.parse(run('openspec', ['context', '--json'], true));
  if (!context.root?.path || realpathSync(context.root.path) !== realpathSync(root)) {
    throw new Error('OpenSpec debe resolver este checkout; no se admite un store externo.');
  }
  const status = JSON.parse(run('openspec', ['status', '--change', change, '--json'], true));
  if (status.schemaName !== 'spec-driven') throw new Error('Se requiere schema spec-driven.');
  for (const id of ['proposal', 'specs', 'design', 'tasks']) {
    if (!status.artifacts?.some((a) => a.id === id && a.status === 'done')) {
      throw new Error(`Artefacto pendiente: ${id}`);
    }
  }
  for (const file of planFiles(dir)) {
    if (!readFileSync(file, 'utf8').trim()) throw new Error(`Artefacto vacío: ${file}`);
  }
  run('openspec', ['validate', change, '--strict', '--no-interactive']);
  return planHash(dir);
}

function approved(dir, digest) {
  const receipt = resolve(dir, 'review.json');
  if (!existsSync(receipt)) throw new Error(`Falta revisión humana: pnpm agent:approve ${change}`);
  const review = JSON.parse(readFileSync(receipt, 'utf8'));
  if (review.change !== change || review.planHash !== digest || review.decision !== 'approved') {
    throw new Error('Plan modificado o revisión inválida. Requiere nueva aprobación humana.');
  }
}

async function main() {
  if (!['ready', 'approve', 'apply', 'verify'].includes(action)
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change ?? '')
      || (action === 'apply' && !['default', 'smol'].includes(role))
      || (args.length && !(action === 'apply' && idle))) {
    throw new Error('Uso: pipeline.mjs ready|approve|verify <change>; apply default|smol <change> [--idle]');
  }
  const dir = inside(resolve(root, 'openspec/changes', change));
  const digest = ready(dir);
  if (action === 'ready') {
    console.log(`Propose válido: ${change}. Pendiente revisión humana. SHA256 ${digest}`);
    return;
  }
  if (action === 'approve') {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error('La aprobación requiere una terminal humana interactiva.');
    }
    console.log(`Revisa proposal.md, design.md, specs/ y tasks.md en ${dir}`);
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    let answer;
    try { answer = await prompt.question(`Escribe "aprobar ${change}" si revisaste este plan: `); }
    finally { prompt.close(); }
    if (answer !== `aprobar ${change}`) throw new Error('No aprobado.');
    if (planHash(dir) !== digest) throw new Error('El plan cambió durante la revisión; repetir.');
    writeFileSync(resolve(dir, 'review.json'), JSON.stringify({
      change, decision: 'approved', approvedAt: new Date().toISOString(), planHash: digest,
    }, null, 2) + '\n');
    console.log('Aprobación registrada.');
    return;
  }
  approved(dir, digest);
  if (action === 'apply') {
    run('omp', ['--model', `@${role}`, '--no-prewalk',
      ...(idle ? [] : [`/opsx-apply ${change}`])]);
    return;
  }
  const instruction = JSON.parse(run('openspec', ['instructions', 'apply', '--change', change, '--json'], true));
  if (!instruction.tasks?.length || instruction.tasks.some((task) => task.done !== true)) {
    throw new Error('Apply incompleto: faltan tasks comprobadas.');
  }
  const startedAt = new Date().toISOString();
  run('pnpm', ['agent:test']);
  // Detect plan changes while checks were running.
  approved(dir, planHash(dir));
  writeFileSync(resolve(dir, 'verification.json'), JSON.stringify({
    change, planHash: digest, startedAt, finishedAt: new Date().toISOString(),
    command: 'pnpm agent:test', result: 'passed',
    head: run('git', ['rev-parse', 'HEAD'], true),
    gitStatus: run('git', ['status', '--short'], true),
    limits: 'check/build no sustituyen pruebas funcionales ni revisión visual. Repetir si cambia código.',
  }, null, 2) + '\n');
  console.log(`Apply comprobado: ${change}. Revisa diff y aceptación funcional antes de archive.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
