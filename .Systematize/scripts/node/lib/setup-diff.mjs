// Setup diff prerequisites and compute artifact changes for a feature
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  getArtifactHash,
  getCurrentBranch,
  getFeatureDir,
  getFeaturePathsEnv,
  getRepoRoot,
  getTrackedIDs,
  parseArgs,
  readJsonFile
} from './common.mjs';

export default async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.help) {
    console.log('Usage: syskit setup-diff [OPTIONS]');
    console.log('  --branch    Target feature branch');
    console.log('  --snapshot  Snapshot timestamp to compare against');
    console.log('  --json      Output results in JSON format');
    console.log('  --help      Show this help message');
    return;
  }

  const repoRoot = getRepoRoot();
  const paths = getFeaturePathsEnv();
  const branch = opts.branch || paths.CURRENT_BRANCH || getCurrentBranch();
  const featureDir = opts.branch
    ? getFeatureDir(repoRoot, branch)
    : paths.FEATURE_DIR;

  if (!existsSync(featureDir)) {
    console.error(`ERROR: Feature directory not found: ${featureDir}`);
    process.exit(1);
  }

  // Gather current state
  const artifactNames = ['sys.md', 'plan.md', 'tasks.md', 'research.md', 'AGENTS.md'];
  const currentState = {};
  for (const name of artifactNames) {
    const filePath = join(featureDir, name);
    if (existsSync(filePath)) {
      currentState[name] = {
        hash: getArtifactHash(filePath),
        ids: getTrackedIDs(filePath)
      };
    }
  }

  if (Object.keys(currentState).length === 0) {
    console.error(`ERROR: No artifacts found in ${featureDir}`);
    process.exit(1);
  }

  // Load baseline from sync-state if available
  const syncStatePath = join(repoRoot, '.Systematize', 'memory', 'sync-state.json');
  const syncState = readJsonFile(syncStatePath);
  let baseline = null;
  if (syncState && syncState.features && syncState.features[branch]) {
    baseline = syncState.features[branch];
  }

  // Compute changes
  const changes = {};
  for (const [name, current] of Object.entries(currentState)) {
    const baselineHash = baseline && baseline[name] ? baseline[name].hash : null;
    changes[name] = {
      status: baselineHash === null ? 'new' : baselineHash === current.hash ? 'unchanged' : 'modified',
      current_hash: current.hash,
      baseline_hash: baselineHash,
      tracked_ids: current.ids
    };
  }

  const result = {
    FEATURES_DIR: featureDir,
    AMINOOOF_DIR: featureDir,
    BRANCH: branch,
    HAS_GIT: paths.HAS_GIT,
    artifacts: Object.keys(currentState),
    changes,
    has_baseline: baseline !== null
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`FEATURES_DIR: ${featureDir}`);
    console.log(`BRANCH: ${branch}`);
    console.log(`Baseline: ${baseline !== null ? 'available' : 'none'}`);
    for (const [name, change] of Object.entries(changes)) {
      console.log(`  ${name}: ${change.status}`);
    }
  }
}
