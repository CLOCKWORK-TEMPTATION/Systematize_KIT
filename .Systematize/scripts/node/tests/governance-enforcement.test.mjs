import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const cliPath = join(repoRoot, '.Systematize', 'scripts', 'node', 'cli.mjs');

function createTempRepo() {
  const tempRepo = join(tmpdir(), `syskit-gov-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(tempRepo, { recursive: true });
  execFileSync('git', ['init', '-q'], { cwd: tempRepo, stdio: 'pipe' });
  mkdirSync(join(tempRepo, '.Systematize', 'templates'), { recursive: true });
  mkdirSync(join(tempRepo, '.Systematize', 'memory'), { recursive: true });
  mkdirSync(join(tempRepo, '.Systematize', 'config'), { recursive: true });
  mkdirSync(join(tempRepo, 'docs', 'policies'), { recursive: true });
  writeFileSync(join(tempRepo, '.Systematize', 'templates', 'sys-template.md'), '# Sys\n', 'utf8');
  writeFileSync(join(tempRepo, '.Systematize', 'templates', 'review-template.md'), '# Review\n', 'utf8');
  writeFileSync(join(tempRepo, '.Systematize', 'templates', 'plan-template.md'), '# Plan\n', 'utf8');
  writeFileSync(join(tempRepo, 'docs', 'policies', 'systematize-policy.md'), '# Policy\n', 'utf8');
  writeFileSync(join(tempRepo, 'docs', 'policies', 'analyze-policy.md'), '# Analyze Policy\n', 'utf8');
  return tempRepo;
}

function captureFailure(fn) {
  try {
    fn();
  } catch (error) {
    return `${error.stdout || ''}\n${error.stderr || ''}\n${error.message || ''}`;
  }
  throw new Error('Expected command to fail, but it succeeded.');
}

// ── Catalog integrity: no llm-only or integration-only commands remain ──

test('command catalog has zero llm-only commands', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  const llmOnly = catalog.commands.filter((c) => c.execution_mode === 'llm-only');
  assert.equal(llmOnly.length, 0, `Commands still marked llm-only: ${llmOnly.map((c) => c.name).join(', ')}`);
});

test('command catalog has zero integration-only commands', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  const integrationOnly = catalog.commands.filter((c) => c.execution_mode === 'integration-only');
  assert.equal(integrationOnly.length, 0, `Commands still marked integration-only: ${integrationOnly.map((c) => c.name).join(', ')}`);
});

test('every hybrid command has a runtime_command reference', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  for (const command of catalog.commands) {
    if (command.execution_mode === 'hybrid') {
      assert.ok(command.runtime_command, `Hybrid command ${command.name} is missing runtime_command`);
    }
  }
});

test('every runtime_command in the catalog exists in cli.mjs COMMANDS', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  const cliContent = readFileSync(cliPath, 'utf8');
  for (const command of catalog.commands) {
    if (command.runtime_command) {
      assert.ok(
        cliContent.includes(`'${command.runtime_command}'`),
        `runtime_command '${command.runtime_command}' for ${command.name} not found in cli.mjs`
      );
    }
  }
});

test('every hybrid runtime module file exists', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  for (const command of catalog.commands) {
    if (command.execution_mode === 'hybrid' && command.runtime_command) {
      const modulePath = join(repoRoot, '.Systematize', 'scripts', 'node', 'lib', `${command.runtime_command}.mjs`);
      assert.ok(existsSync(modulePath), `Runtime module missing for ${command.name}: ${modulePath}`);
    }
  }
});

test('command markdown files match catalog execution_mode', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  for (const command of catalog.commands) {
    const content = readFileSync(join(repoRoot, command.file), 'utf8');
    assert.ok(
      content.includes(`command_execution_mode: ${command.execution_mode}`),
      `${command.file} has wrong execution_mode (expected ${command.execution_mode})`
    );
    assert.ok(
      content.includes(`runtime_command: ${command.runtime_command ?? 'null'}`),
      `${command.file} has wrong runtime_command (expected ${command.runtime_command ?? 'null'})`
    );
  }
});

// ── Runtime enforcement: hybrid commands enforce gates ──

test('setup-systematize blocks without policy file', () => {
  const tempRepo = createTempRepo();
  try {
    rmSync(join(tempRepo, 'docs', 'policies', 'systematize-policy.md'));
    const output = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-systematize', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(output, /policy/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-clarify blocks without sys.md', () => {
  const tempRepo = createTempRepo();
  try {
    mkdirSync(join(tempRepo, 'features', '001-test'), { recursive: true });
    const output = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-clarify', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(output, /sys\.md not found/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-review blocks without all three mandatory artifacts', () => {
  const tempRepo = createTempRepo();
  const featureDir = join(tempRepo, 'features', '001-test');
  try {
    mkdirSync(featureDir, { recursive: true });

    // No sys.md
    const noSys = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-review', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(noSys, /sys\.md not found/i);

    // Has sys.md but no plan.md
    writeFileSync(join(featureDir, 'sys.md'), '# Sys\nContent here.\n', 'utf8');
    const noPlan = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-review', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(noPlan, /plan\.md not found/i);

    // Has sys.md and plan.md but no tasks.md
    writeFileSync(join(featureDir, 'plan.md'), '# Plan\nContent here.\n', 'utf8');
    const noTasks = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-review', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(noTasks, /tasks\.md not found/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-implement blocks without mandatory artifacts', () => {
  const tempRepo = createTempRepo();
  const featureDir = join(tempRepo, 'features', '001-test');
  try {
    mkdirSync(featureDir, { recursive: true });

    const noSys = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-implement', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(noSys, /sys\.md not found/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-checklist blocks without sys.md', () => {
  const tempRepo = createTempRepo();
  try {
    mkdirSync(join(tempRepo, 'features', '001-test'), { recursive: true });
    const output = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-checklist', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(output, /sys\.md not found/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-analyze blocks without policy file', () => {
  const tempRepo = createTempRepo();
  try {
    rmSync(join(tempRepo, 'docs', 'policies', 'analyze-policy.md'));
    const output = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-analyze', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(output, /policy/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-diff blocks without feature directory', () => {
  const tempRepo = createTempRepo();
  try {
    const output = captureFailure(() => execFileSync(
      'node', [cliPath, 'setup-diff', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
    ));
    assert.match(output, /not found/i);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-guide detects uninitialized state', () => {
  const tempRepo = createTempRepo();
  try {
    // Remove config to simulate uninitialized
    rmSync(join(tempRepo, '.Systematize', 'config'), { recursive: true, force: true });
    rmSync(join(tempRepo, '.Systematize', 'memory'), { recursive: true, force: true });
    const output = execFileSync(
      'node', [cliPath, 'setup-guide', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.equal(result.status, 'not_initialized');
    assert.equal(result.recommended_command, '/syskit.init');
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-guide detects initialized state and recommends next command', () => {
  const tempRepo = createTempRepo();
  try {
    writeFileSync(join(tempRepo, '.Systematize', 'config', 'syskit-config.yml'), 'version: 2.0\n', 'utf8');
    const output = execFileSync(
      'node', [cliPath, 'setup-guide', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.equal(result.status, 'initialized');
    assert.equal(result.recommended_command, '/syskit.systematize');
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

// ── Successful hybrid command execution ──

test('setup-systematize succeeds with valid prerequisites', () => {
  const tempRepo = createTempRepo();
  try {
    const output = execFileSync(
      'node', [cliPath, 'setup-systematize', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.ok(result.FEATURE_SYS);
    assert.ok(result.POLICY_PATH);
    assert.equal(existsSync(result.FEATURE_SYS), true);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-clarify succeeds with valid prerequisites', () => {
  const tempRepo = createTempRepo();
  const featureDir = join(tempRepo, 'features', '001-test');
  try {
    mkdirSync(featureDir, { recursive: true });
    writeFileSync(join(featureDir, 'sys.md'), '# Sys\nContent.\n', 'utf8');
    const output = execFileSync(
      'node', [cliPath, 'setup-clarify', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.ok(result.FEATURE_SYS);
    assert.equal(result.BRANCH, '001-test');
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-review succeeds with all three artifacts', () => {
  const tempRepo = createTempRepo();
  const featureDir = join(tempRepo, 'features', '001-test');
  try {
    mkdirSync(featureDir, { recursive: true });
    writeFileSync(join(featureDir, 'sys.md'), '# Sys\nContent.\n', 'utf8');
    writeFileSync(join(featureDir, 'plan.md'), '# Plan\nContent.\n', 'utf8');
    writeFileSync(join(featureDir, 'tasks.md'), '# Tasks\nContent.\n', 'utf8');
    const output = execFileSync(
      'node', [cliPath, 'setup-review', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.ok(result.REVIEW);
    assert.ok(result.FEATURE_SYS);
    assert.ok(result.IMPL_PLAN);
    assert.ok(result.TASKS);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('setup-checklist creates checklists directory', () => {
  const tempRepo = createTempRepo();
  const featureDir = join(tempRepo, 'features', '001-test');
  try {
    mkdirSync(featureDir, { recursive: true });
    writeFileSync(join(featureDir, 'sys.md'), '# Sys\nContent.\n', 'utf8');
    const output = execFileSync(
      'node', [cliPath, 'setup-checklist', '--json', '--branch', '001-test'],
      { cwd: tempRepo, encoding: 'utf8' }
    );
    const result = JSON.parse(output);
    assert.ok(result.CHECKLISTS_DIR);
    assert.equal(existsSync(result.CHECKLISTS_DIR), true);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

// ── Distribution: all execution modes are accounted for ──

test('catalog only contains runtime-backed and hybrid execution modes', () => {
  const catalog = JSON.parse(readFileSync(join(repoRoot, '.Systematize', 'config', 'command-catalog.json'), 'utf8'));
  const validModes = new Set(['runtime-backed', 'hybrid']);
  for (const command of catalog.commands) {
    assert.ok(
      validModes.has(command.execution_mode),
      `Command ${command.name} has unexpected execution_mode: ${command.execution_mode}`
    );
  }
});
