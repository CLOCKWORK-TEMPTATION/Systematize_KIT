// Setup implementation prerequisites for a feature
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  ensureDir,
  getCurrentBranch,
  getDocumentCompletionStatus,
  getFeatureDir,
  getFeaturePathsEnv,
  getRepoRoot,
  parseArgs,
  testFeatureBranch
} from './common.mjs';

export default async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.help) {
    console.log('Usage: syskit setup-implement [OPTIONS]');
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

  // Gate: tasks.md must exist and be complete
  const tasksFile = join(featureDir, 'tasks.md');
  const tasksStatus = getDocumentCompletionStatus(tasksFile);
  if (tasksStatus.status === 'not_started') {
    console.error(`ERROR: tasks.md not found in ${featureDir}`);
    console.error('Run /syskit.tasks first to create the task breakdown.');
    process.exit(1);
  }

  // Warn if checklists exist but have incomplete items
  const checklistsDir = join(featureDir, 'checklists');
  let checklistWarning = null;
  if (existsSync(checklistsDir)) {
    const checklistFiles = readdirSync(checklistsDir).filter((f) => f.endsWith('.md'));
    for (const file of checklistFiles) {
      const content = readFileSync(join(checklistsDir, file), 'utf8');
      if (/☐\s/.test(content)) {
        checklistWarning = `Checklist ${file} has incomplete items. Review before proceeding.`;
        if (!opts.json) console.warn(`WARNING: ${checklistWarning}`);
        break;
      }
    }
  }

  const result = {
    FEATURE_SYS: sysFile,
    IMPL_PLAN: planFile,
    TASKS: tasksFile,
    FEATURES_DIR: featureDir,
    AMINOOOF_DIR: featureDir,
    BRANCH: branch,
    HAS_GIT: paths.HAS_GIT,
    checklist_warning: checklistWarning
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    for (const [key, value] of Object.entries(result)) {
      if (value !== null) console.log(`${key}: ${value}`);
    }
  }
}
