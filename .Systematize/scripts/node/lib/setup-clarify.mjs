// Setup clarification prerequisites for a feature
import { existsSync } from 'fs';
import { join } from 'path';
import {
  ensureDir,
  getCurrentBranch,
  getFeatureDir,
  getFeaturePathsEnv,
  getRepoRoot,
  parseArgs,
  testFeatureBranch
} from './common.mjs';

export default async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.help) {
    console.log('Usage: syskit setup-clarify [OPTIONS]');
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

  ensureDir(featureDir);

  const sysFile = join(featureDir, 'sys.md');
  if (!existsSync(sysFile)) {
    console.error(`ERROR: sys.md not found in ${featureDir}`);
    console.error('Run /syskit.systematize first to create the governing sys document.');
    process.exit(1);
  }

  const result = {
    FEATURE_SYS: sysFile,
    FEATURES_DIR: featureDir,
    AMINOOOF_DIR: featureDir,
    BRANCH: branch,
    HAS_GIT: paths.HAS_GIT
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const [key, value] of Object.entries(result)) {
      console.log(`${key}: ${value}`);
    }
  }
}
