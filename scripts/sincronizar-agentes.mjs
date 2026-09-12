import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Solo configuración del flujo: nunca código, specs de funcionalidades o secretos.
export const managedFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/flujo-orca-openspec.md',
  '.codex/config.toml',
  '.codex/rules/orca.rules',
  '.claude/settings.json',
  'openspec/config.yaml',
  'scripts/sincronizar-agentes.mjs'
];

const git = (root, args) => execFileSync('git', ['-C', root, ...args], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();

function safePath(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    let entry;
    try {
      entry = fs.lstatSync(current);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (entry?.isSymbolicLink()) throw new Error(`No se siguen enlaces simbólicos: ${current}`);
  }
  return current;
}

function read(root, relative) {
  const file = safePath(root, relative);
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export function planSync(source, target, knownVersions) {
  const updates = [];
  for (const file of managedFiles) {
    const next = read(source, file);
    if (next === null) throw new Error(`Falta archivo fuente: ${file}`);
    const before = read(target, file);
    if (before === next) continue;
    if (before !== null && !knownVersions(file).includes(before)) {
      throw new Error(`Conflicto local en ${file}; conservarlo y reconciliar antes de sincronizar.`);
    }
    updates.push({ file, before, next });
  }

  const packageBefore = read(target, 'package.json');
  const packageTarget = JSON.parse(packageBefore);
  const desiredScripts = JSON.parse(read(source, 'package.json')).scripts;
  const previousScripts = knownVersions('package.json').map(text => JSON.parse(text).scripts ?? {});
  packageTarget.scripts ??= {};
  let packageChanged = false;
  for (const [key, value] of Object.entries(desiredScripts).filter(([key]) => /^agents?:/.test(key))) {
    const before = packageTarget.scripts[key];
    if (before === value) continue;
    if (before !== undefined && !previousScripts.some(scripts => scripts[key] === before)) {
      throw new Error(`Conflicto local en package.json scripts.${key}`);
    }
    packageTarget.scripts[key] = value;
    packageChanged = true;
  }
  if (packageChanged) updates.push({ file: 'package.json', before: packageBefore, next: `${JSON.stringify(packageTarget, null, 2)}\n` });

  const ignoreBefore = read(target, '.gitignore');
  let ignore = ignoreBefore ?? '';
  const exceptions = [
    '!.codex/', '.codex/*', '!.codex/config.toml', '!.codex/rules/',
    '.codex/rules/*', '!.codex/rules/orca.rules', '!.claude/',
    '.claude/*', '!.claude/settings.json'
  ];
  if (!ignore.includes('# Configuración compartida del flujo Orca')) {
    ignore += `\n# Configuración compartida del flujo Orca\n${exceptions.join('\n')}\n`;
    updates.push({ file: '.gitignore', before: ignoreBefore, next: ignore });
  }
  return updates;
}

export function applyUpdates(target, updates) {
  for (const { file, before } of updates) {
    if (read(target, file) !== before) throw new Error(`Cambió durante la sincronización: ${file}`);
  }
  for (const { file, next } of updates) {
    const destination = safePath(target, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, next);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Desde el coordinador: pnpm agents:sync --target /ruta/hijo [--apply | --check]');
    return;
  }
  let targetArg;
  let mode = 'plan';
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--target' && !targetArg) targetArg = args[++index];
    else if (['--apply', '--check'].includes(args[index]) && mode === 'plan') mode = args[index].slice(2);
    else throw new Error(`Argumento inválido: ${args[index]}`);
  }
  if (!targetArg) throw new Error('Indicar --target con la ruta del worktree hijo obtenido de Orca.');

  const source = fs.realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const target = fs.realpathSync(path.resolve(targetArg));
  const common = root => fs.realpathSync(git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']));
  if (source === target || common(source) !== common(target)) throw new Error('El destino debe ser otro worktree del mismo repositorio.');
  if (fs.realpathSync(git(target, ['rev-parse', '--show-toplevel'])) !== target) throw new Error('El destino debe ser la raíz del worktree.');
  if (git(source, ['rev-parse', '--path-format=absolute', '--git-dir']) !== common(source)) throw new Error('Ejecutar el script del checkout principal, no el de un hijo.');

  const versions = file => {
    const commits = git(source, ['log', '-20', '--format=%H', '--', file]).split('\n').filter(Boolean);
    return commits.flatMap(commit => {
      try {
        return [execFileSync('git', ['-C', source, 'show', `${commit}:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })];
      } catch {
        return [];
      }
    });
  };

  const updates = planSync(source, target, versions);
  if (mode === 'apply') applyUpdates(target, updates);
  console.log(JSON.stringify({ source, target, mode, files: updates.map(({ file }) => file), synchronized: mode === 'apply' || updates.length === 0 }, null, 2));
  if (mode === 'check' && updates.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
