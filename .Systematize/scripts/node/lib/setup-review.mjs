// Setup review prerequisites for a feature
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  ensureDir,
  getCurrentBranch,
  getDocumentCompletionStatus,
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
    console.log('Usage: syskit setup-review [OPTIONS]');
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

  // Gate: sys.md must exist
  const sysFile = join(featureDir, 'sys.md');
  if (!existsSync(sysFile)) {
    console.error(`ERROR: sys.md not found in ${featureDir}`);
    console.error('Run /syskit.systematize first to create the governing sys document.');
    process.exit(1);
  }

  // Gate: plan.md must exist and be complete
  const planFile = join(featureDir, 'plan.md');
  const planStatus = getDocumentCompletionStatus(planFile);
  if (planStatus.status === 'not_started') {
    console.error(`ERROR: plan.md not found in ${featureDir}`);
    console.error('Run /syskit.plan first to create the implementation plan.');
    process.exit(1);
  }

  // Gate: tasks.md must exist
  const tasksFile = join(featureDir, 'tasks.md');
  const tasksStatus = getDocumentCompletionStatus(tasksFile);
  if (tasksStatus.status === 'not_started') {
    console.error(`ERROR: tasks.md not found in ${featureDir}`);
    console.error('Run /syskit.tasks first to create the task breakdown.');
    process.exit(1);
  }

  // Copy review template if it exists
  const reviewFile = join(featureDir, 'review.md');
  if (!existsSync(reviewFile)) {
    const template = resolveTemplate(repoRoot, 'review-template');
    if (template && existsSync(template)) {
      copyFileSync(template, reviewFile);
      if (!opts.json) console.log(`Copied review template to ${reviewFile}`);
    } else {
      if (!opts.json) console.warn('Review template not found');
      writeFileSync(reviewFile, '', 'utf8');
    }
  }

  const result = {
    FEATURE_SYS: sysFile,
    IMPL_PLAN: planFile,
    TASKS: tasksFile,
    REVIEW: reviewFile,
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
