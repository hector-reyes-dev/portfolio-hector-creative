import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('./pipeline.mjs', import.meta.url));

test('Gates con OpenSpec real: artefactos, aprobación, tasks y checks', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'omp-pipeline-test-'));
  const dir = join(cwd, 'openspec/changes/smoke');
  const env = { ...process.env, OPENSPEC_TELEMETRY: '0' };
  const gate = (...args) => spawnSync(process.execPath, [script, ...args], { cwd, env, encoding: 'utf8' });
  const put = (file, body) => writeFileSync(join(dir, file), body);
  try {
    const source = fileURLToPath(new URL('../../', import.meta.url));
    const clone = spawnSync('git', ['clone', '--no-checkout', '--shared', source, cwd], { encoding: 'utf8' });
    assert.equal(clone.status, 0, clone.stderr);
    mkdirSync(join(dir, 'specs/pipeline'), { recursive: true });
    writeFileSync(join(cwd, 'openspec/config.yaml'), 'schema: spec-driven\n');
    put('.openspec.yaml', 'schema: spec-driven\ncreated: 2026-09-12\n');
    put('proposal.md', '# Why\nValidate pipeline gates.\n\n## What Changes\n- Add a smoke check.\n\n## Capabilities\n### New Capabilities\n- `pipeline`: local checks\n\n## Impact\nLocal scripts only.\n');
    put('design.md', '## Context\nLocal fixture.\n## Goals / Non-Goals\nVerify gates only.\n## Decisions\nUse real OpenSpec.\n## Risks / Trade-offs\nNo provider calls.\n');
    put('tasks.md', '## 1. Validation\n- [ ] 1.1 Run local check\n');
    assert.notEqual(gate('ready', 'smoke').status, 0, 'spec inexistente debe bloquear');
    put('specs/pipeline/spec.md', '## ADDED Requirements\n\n### Requirement: Local validation\nThe pipeline SHALL validate its local artifacts before apply.\n\n#### Scenario: Valid plan\n- **WHEN** all artifacts are present\n- **THEN** local validation succeeds\n');
    const ready = gate('ready', 'smoke');
    assert.equal(ready.status, 0, ready.stderr + ready.stdout);
    assert.match(gate('apply', 'smol', 'smoke').stderr, /Falta revisión humana/);
    assert.match(gate('approve', 'smoke').stderr, /terminal humana interactiva/);
    const digest = ready.stdout.match(/SHA256 ([a-f0-9]{64})/)[1];
    // Synthetic approval ONLY in this isolated test fixture.
    put('review.json', JSON.stringify({ change: 'smoke', decision: 'approved', planHash: digest }));
    assert.match(gate('verify', 'smoke').stderr, /faltan tasks/);
    put('tasks.md', '## 1. Validation\n- [x] 1.1 Run local check\n');
    assert.match(gate('ready', 'smoke').stdout, new RegExp(digest), 'checkbox no invalida hash');
    put('design.md', 'Changed the approved plan.\n');
    assert.match(gate('verify', 'smoke').stderr, /nueva aprobación humana/);
    put('design.md', '## Context\nLocal fixture.\n## Goals / Non-Goals\nVerify gates only.\n## Decisions\nUse real OpenSpec.\n## Risks / Trade-offs\nNo provider calls.\n');
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ scripts: { 'agent:test': 'node -e "process.exit(1)"' } }));
    assert.notEqual(gate('verify', 'smoke').status, 0, 'check fallido debe bloquear');
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ scripts: { 'agent:test': 'node -e "process.exit(0)"' } }));
    const verified = gate('verify', 'smoke');
    assert.equal(verified.status, 0, verified.stderr + verified.stdout);
    assert.equal(JSON.parse(readFileSync(join(dir, 'verification.json'), 'utf8')).result, 'passed');
    assert.notEqual(gate('ready', '../../escape').status, 0);
  } finally {
    // Only the exact randomly created fixture directory is removed.
    rmSync(cwd, { recursive: true, force: true });
  }
});
