import { execSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { ensureDir, getRepoRoot, parseArgs } from './common.mjs';
import { getAvailableExtensionPackages } from './configuration.mjs';

const DIST_INCLUDE_PATHS = [
  'README.md',
  'commands',
  'docs',
  join('.Systematize', 'config'),
  join('.Systematize', 'extension-packages'),
  join('.Systematize', 'templates'),
  join('.Systematize', 'scripts'),
  join('.Systematize', 'presets'),
  join('.Systematize', 'extensions', 'README.md'),
  join('.Systematize', 'extensions', 'commands', '.gitkeep'),
  join('.Systematize', 'extensions', 'templates', '.gitkeep')
];

function copyIntoStage(sourceRoot, stageRoot, relativePath) {
  const sourcePath = join(sourceRoot, relativePath);
  if (!existsSync(sourcePath)) return;

  const targetPath = join(stageRoot, relativePath);
  ensureDir(dirname(targetPath));
  cpSync(sourcePath, targetPath, { recursive: true, force: true });
}

function writeInstallerFiles(stageRoot) {
  writeFileSync(
    join(stageRoot, 'install-framework.mjs'),
    `#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const cliPath = join(root, '.Systematize', 'scripts', 'node', 'cli.mjs');
const result = spawnSync('node', [cliPath, 'init', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
`,
    'utf8'
  );

  writeFileSync(
    join(stageRoot, 'install-framework.ps1'),
    `#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$InitArgs
)

$ErrorActionPreference = 'Stop'
$cliPath = Join-Path $PSScriptRoot '.Systematize/scripts/node/cli.mjs'
& node $cliPath init @InitArgs
exit $LASTEXITCODE
`,
    'utf8'
  );

  writeFileSync(
    join(stageRoot, 'INSTALL.md'),
    `# Systematize Framework Distribution

## Install Into A Repository

\`\`\`text
node install-framework.mjs --target-path <repo>
\`\`\`

## Windows Compatibility Shell

\`\`\`text
pwsh -File install-framework.ps1 --target-path <repo>
\`\`\`

## Runtime Package

The packaged Node runtime tarball is emitted next to this bundle inside the parent \`dist/\` directory.
`,
    'utf8'
  );
}

export default async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.help) {
    console.log(`Usage: syskit build-distribution [--output <path>] [--json] [--help]

OPTIONS:
  --output <path>       Distribution root directory
  --json                Output JSON
  --help                Show help`);
    return;
  }

  const repoRoot = getRepoRoot();
  const distRoot = resolve(opts.output || join(repoRoot, 'dist'));
  const stageRoot = join(distRoot, 'systematize-framework');
  const runtimePackageRoot = join(repoRoot, '.Systematize', 'scripts', 'node');
  const runtimePackageJson = JSON.parse(readFileSync(join(runtimePackageRoot, 'package.json'), 'utf8'));
  rmSync(stageRoot, { recursive: true, force: true });
  ensureDir(stageRoot);
  ensureDir(distRoot);

  for (const relativePath of DIST_INCLUDE_PATHS) {
    copyIntoStage(repoRoot, stageRoot, relativePath);
  }

  writeInstallerFiles(stageRoot);

  const packedOutput = execSync(
    `npm pack "${runtimePackageRoot}" --pack-destination "${distRoot}"`,
    { cwd: repoRoot, encoding: 'utf8' }
  );
  const tarballName = packedOutput.trim().split(/\r?\n/).pop();

  const manifest = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    bundle_root: relative(repoRoot, stageRoot),
    runtime_package: {
      name: runtimePackageJson.name,
      version: runtimePackageJson.version,
      tarball: tarballName
    },
    included_paths: DIST_INCLUDE_PATHS,
    available_extensions: getAvailableExtensionPackages(repoRoot).map((item) => ({
      name: item.name,
      capability: item.capability || null,
      install_by_default: item.install_by_default === true
    }))
  };

  writeFileSync(join(stageRoot, 'distribution-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const result = {
    distRoot,
    stageRoot,
    tarball: join(distRoot, tarballName),
    manifest: join(stageRoot, 'distribution-manifest.json')
  };

  if (opts.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Distribution bundle created: ${stageRoot}`);
    console.log(`Runtime package created: ${join(distRoot, tarballName)}`);
  }
}
