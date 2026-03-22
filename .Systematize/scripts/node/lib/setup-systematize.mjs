// Setup systematize document scaffolding for a feature
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  ensureDir,
  getCurrentBranch,
  getFeatureDir,
  getFeaturePathsEnv,
  getRepoRoot,
  parseArgs,
  resolveTemplate,
  testFeatureBranch
} from './common.mjs';

export default async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.help) {
    console.log('Usage: syskit setup-systematize [OPTIONS]');
    console.log('  --branch  Target feature branch');
    console.log('  --json    Output results in JSON format');
    console.log('  --help    Show this help message');
    return;
  }

  const repoRoot = getRepoRoot();
  const paths = getFeaturePathsEnv({ mutating: true, ensureExists: true });
  const branch = opts.branch || paths.CURRENT_BRANCH || getCurrentBranch();
  const featureDir = opts.branch
    ? getFeatureDir(repoRoot, branch, { mutating: true, ensureExists: true })
    : paths.FEATURE_DIR;

  // Check if we're on a proper feature branch
  if (!testFeatureBranch(branch) && paths.HAS_GIT) {
    console.error('ERROR: Not on a feature branch.');
    console.error('Feature branches should be named like: 001-feature-name');
    process.exit(1);
  }

  // Ensure the feature directory exists
  ensureDir(featureDir);

  // Validate policy file exists
  const policyPath = join(repoRoot, 'docs', 'policies', 'systematize-policy.md');
  if (!existsSync(policyPath)) {
    console.error('ERROR: Systematize policy file not found at docs/policies/systematize-policy.md');
    process.exit(1);
  }

  const sysFile = join(featureDir, 'sys.md');

  // Copy sys template if it exists and sys.md doesn't yet
  if (!existsSync(sysFile)) {
    const template = resolveTemplate(repoRoot, 'sys-template');
    if (template && existsSync(template)) {
      copyFileSync(template, sysFile);
      if (!opts.json) console.log(`Copied sys template to ${sysFile}`);
    } else {
      if (!opts.json) console.warn('Sys template not found');
      writeFileSync(sysFile, '', 'utf8');
    }
  }

  const result = {
    FEATURE_SYS: sysFile,
    FEATURES_DIR: featureDir,
    AMINOOOF_DIR: featureDir,
    BRANCH: branch,
    HAS_GIT: paths.HAS_GIT,
    POLICY_PATH: policyPath
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const [key, value] of Object.entries(result)) {
      console.log(`${key}: ${value}`);
    }
  }
}
