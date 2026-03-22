import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const distributionContractPath = join(repoRoot, '.Systematize', 'config', 'distribution-manifest.json');
const windowsAbsolutePathPattern = /\b[A-Za-z]:\\[^\r\n]*/;
const distributionFixturePaths = [
  'README.md',
  'package.json',
  'package-lock.json',
  'install-syskit.ps1',
  'commands',
  'docs',
  '.Systematize'
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function collectMarkdownFiles(relativeDir) {
  const absoluteDir = join(repoRoot, relativeDir);
  const files = [];

  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(relativePath));
      continue;
    }

    if (entry.name.endsWith('.md')) {
      files.push(relativePath);
    }
  }

  return files;
}

function createDistributionFixtureRepo() {
  const tempRepo = mkdtempSync(join(tmpdir(), 'syskit-distribution-'));

  for (const relativePath of distributionFixturePaths) {
    cpSync(join(repoRoot, relativePath), join(tempRepo, relativePath), { recursive: true, force: true });
  }

  execFileSync('git', ['init', '-q'], { cwd: tempRepo, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.name', 'Codex Test'], { cwd: tempRepo, stdio: 'pipe' });
  execFileSync('git', ['config', 'user.email', 'codex@example.com'], { cwd: tempRepo, stdio: 'pipe' });
  execFileSync('git', ['add', '.'], { cwd: tempRepo, stdio: 'pipe' });
  execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: tempRepo, stdio: 'pipe' });

  return tempRepo;
}

function runBuildDistribution(tempRepo) {
  return execFileSync(
    'node',
    [join(tempRepo, '.Systematize', 'scripts', 'node', 'cli.mjs'), 'build-distribution', '--json'],
    { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }
  );
}

function runGit(tempRepo, args) {
  return execFileSync('git', args, { cwd: tempRepo, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function captureCommandFailure(runCommand) {
  try {
    runCommand();
  } catch (error) {
    return `${error.stdout || ''}\n${error.stderr || ''}\n${error.message || ''}`;
  }

  throw new Error('Expected command to fail, but it succeeded.');
}

const wrapperContracts = [
  { path: '.Systematize/scripts/powershell/init-syskit.ps1', command: 'init', args: ['--target-path', '--platforms', '--force', '--json'] },
  { path: '.Systematize/scripts/powershell/check-prerequisites.ps1', command: 'check-prerequisites', args: ['--json', '--require-tasks', '--include-tasks', '--paths-only'] },
  { path: '.Systematize/scripts/powershell/check-alerts.ps1', command: 'check-alerts', args: ['--branch', '--severity', '--json'] },
  { path: '.Systematize/scripts/powershell/create-new-feature.ps1', command: 'create-feature', args: ['--short-name', '--number', '--preset', '--json'] },
  { path: '.Systematize/scripts/powershell/export-dashboard.ps1', command: 'export-dashboard', args: ['--branch', '--output', '--open-in-browser', '--json'] },
  { path: '.Systematize/scripts/powershell/generate-constitution.ps1', command: 'generate-constitution', args: ['--project-name', '--version', '--owner', '--pm', '--tech-lead', '--description', '--force', '--json'] },
  { path: '.Systematize/scripts/powershell/generate-pr.ps1', command: 'generate-pr', args: ['--branch', '--base', '--draft', '--json'] },
  { path: '.Systematize/scripts/powershell/get-feature-status.ps1', command: 'feature-status', args: ['--branch', '--json'] },
  { path: '.Systematize/scripts/powershell/record-analytics.ps1', command: 'record-analytics', args: ['--branch', '--event', '--data', '--json'] },
  { path: '.Systematize/scripts/powershell/run-healthcheck.ps1', command: 'healthcheck', args: ['--branch', '--threshold', '--json'] },
  { path: '.Systematize/scripts/powershell/setup-plan.ps1', command: 'setup-plan', args: ['--branch', '--json'] },
  { path: '.Systematize/scripts/powershell/setup-research.ps1', command: 'setup-research', args: ['--branch', '--json'] },
  { path: '.Systematize/scripts/powershell/setup-tasks.ps1', command: 'setup-tasks', args: ['--branch', '--json'] },
  { path: '.Systematize/scripts/powershell/snapshot-artifacts.ps1', command: 'snapshot', args: ['--branch', '--tag', '--json'] },
  { path: '.Systematize/scripts/powershell/update-agent-context.ps1', command: 'update-agent-context', args: ['--agent-type', '--branch', '--json'] },
  { path: '.Systematize/scripts/powershell/update-sync-state.ps1', command: 'update-sync-state', args: ['--branch', '--force', '--json'] },
  { path: '.Systematize/scripts/powershell/auto-commit.ps1', command: 'auto-commit', args: ['--command', '--branch', '--message', '--json'] }
];

test('distribution contract is explicit and repository-safe', () => {
  assert.ok(existsSync(distributionContractPath), 'distribution contract file is missing');

  const contract = JSON.parse(read('.Systematize/config/distribution-manifest.json'));
  assert.equal(contract.bundle_root, 'systematize-framework');
  assert.deepEqual(contract.prebuild_generators, [
    '.Systematize/scripts/node/lib/sync-command-metadata.mjs',
    '.Systematize/scripts/node/lib/generate-command-runtime-map.mjs',
    '.Systematize/scripts/node/lib/generate-project-tree.mjs'
  ]);
  assert.deepEqual(contract.repo_generated_paths, [
    'commands',
    'docs/COMMAND_RUNTIME_MAP.md',
    'docs/_project_tree.json'
  ]);
  assert.deepEqual(contract.generated_stage_files, [
    'INSTALL.md',
    'install-framework.mjs',
    'install-framework.ps1',
    'distribution-manifest.json'
  ]);

  for (const relativePath of [...contract.prebuild_generators, ...contract.include_paths, ...contract.repo_generated_paths]) {
    assert.ok(existsSync(join(repoRoot, relativePath)), `distribution contract path is missing: ${relativePath}`);
  }

  const buildDistributionContent = read('.Systematize/scripts/node/lib/build-distribution.mjs');
  assert.match(
    buildDistributionContent,
    /DISTRIBUTION_CONTRACT_PATH/,
    'build-distribution must read the explicit distribution contract'
  );
  assert.match(
    buildDistributionContent,
    /runPrebuildGenerators/,
    'build-distribution must run the declared prebuild generators'
  );
  assert.match(
    buildDistributionContent,
    /repo_generated_paths/,
    'build-distribution must enforce repository generated paths declared by the contract'
  );
  assert.match(
    buildDistributionContent,
    /Distribution build refused to continue because prebuild generators changed tracked generated repository files\./,
    'build-distribution must fail explicitly when prebuild generation changes tracked repository files'
  );

  const packageJson = JSON.parse(read('package.json'));
  assert.equal(
    packageJson.scripts['package:dist'],
    'node .Systematize/scripts/node/cli.mjs build-distribution',
    'official distribution script must delegate to the Node runtime command'
  );

  assert.ok(!existsSync(join(repoRoot, 'Untitled-2.ini')), 'stray delivery artifact still exists at the repository root');
});

test('official distribution refuses generated repository drift before packaging', () => {
  const tempRepo = createDistributionFixtureRepo();

  try {
    const projectTreePath = join(tempRepo, 'docs', '_project_tree.json');
    const originalProjectTree = readFileSync(projectTreePath, 'utf8');
    writeFileSync(projectTreePath, `${originalProjectTree}\n `, 'utf8');

    const failure = captureCommandFailure(() => runBuildDistribution(tempRepo));

    assert.match(
      failure,
      /Distribution build refused to continue because prebuild generators changed tracked generated repository files\./
    );
    assert.match(failure, /docs\/_project_tree\.json/);
    assert.equal(existsSync(join(tempRepo, 'dist', 'systematize-framework')), false);
    assert.equal(readFileSync(projectTreePath, 'utf8'), originalProjectTree);
    assert.equal(runGit(tempRepo, ['diff', '--name-only']), '');
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('official distribution succeeds from a synchronized repository without mutating tracked files', () => {
  const tempRepo = createDistributionFixtureRepo();

  try {
    const output = runBuildDistribution(tempRepo);
    const result = JSON.parse(output);
    const stagedManifest = JSON.parse(readFileSync(result.manifest, 'utf8'));

    assert.ok(existsSync(result.stageRoot), 'distribution stage root is missing');
    assert.ok(existsSync(result.tarball), 'runtime tarball is missing');
    assert.ok(existsSync(result.manifest), 'distribution manifest is missing');
    assert.deepEqual(
      stagedManifest.repo_generated_paths,
      ['commands', 'docs/COMMAND_RUNTIME_MAP.md', 'docs/_project_tree.json'],
      'distribution manifest must carry the repository generated path contract into the bundle'
    );
    assert.equal(runGit(tempRepo, ['diff', '--name-only']), '');
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('official documentation stays portable', () => {
  const documentationFiles = ['README.md', ...collectMarkdownFiles('docs')];

  for (const relativePath of documentationFiles) {
    const content = read(relativePath);
    assert.doesNotMatch(
      content,
      windowsAbsolutePathPattern,
      `portable documentation contract failed for ${relativePath}`
    );
  }
});

test('powershell wrappers remain thin delegates to the Node runtime', () => {
  for (const wrapper of wrapperContracts) {
    const content = read(wrapper.path);
    const lines = content.split(/\r?\n/);

    assert.match(content, /\. "\$PSScriptRoot\/common\.ps1"/, `wrapper must load common.ps1: ${wrapper.path}`);

    const invocationPattern = new RegExp(`Invoke-NodeSyskitCommand -CommandName '${wrapper.command}'`, 'g');
    const invocations = [...content.matchAll(invocationPattern)];
    assert.equal(invocations.length, 1, `wrapper must delegate exactly once to ${wrapper.command}: ${wrapper.path}`);

    const invokeLineIndex = lines.findIndex((line) => line.includes(`Invoke-NodeSyskitCommand -CommandName '${wrapper.command}'`));
    assert.notEqual(invokeLineIndex, -1, `wrapper invocation line not found: ${wrapper.path}`);

    const trailingLines = lines
      .slice(invokeLineIndex + 1)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));

    assert.deepEqual(
      trailingLines,
      ['exit $LASTEXITCODE'],
      `wrapper must not keep legacy business logic after Node handoff: ${wrapper.path}`
    );

    for (const argToken of wrapper.args) {
      assert.match(
        content,
        new RegExp(argToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `wrapper is missing delegated runtime option ${argToken}: ${wrapper.path}`
      );
    }
  }
});
