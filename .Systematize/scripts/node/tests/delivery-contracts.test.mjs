import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const distributionContractPath = join(repoRoot, '.Systematize', 'config', 'distribution-manifest.json');
const windowsAbsolutePathPattern = /\b[A-Za-z]:\\[^\r\n]*/;

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
  assert.deepEqual(contract.generated_stage_files, [
    'INSTALL.md',
    'install-framework.mjs',
    'install-framework.ps1',
    'distribution-manifest.json'
  ]);

  for (const relativePath of [...contract.prebuild_generators, ...contract.include_paths]) {
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
    /prebuild_generators/,
    'build-distribution must use the manifest generator list rather than a hidden path list'
  );

  const packageJson = JSON.parse(read('package.json'));
  assert.equal(
    packageJson.scripts['package:dist'],
    'node .Systematize/scripts/node/cli.mjs build-distribution',
    'official distribution script must delegate to the Node runtime command'
  );

  assert.ok(!existsSync(join(repoRoot, 'Untitled-2.ini')), 'stray delivery artifact still exists at the repository root');
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
