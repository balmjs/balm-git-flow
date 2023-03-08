import path from 'node:path';
import { cwd } from 'node:process';
import { WORKSPACE_DIR, NO_NEED_TO_MERGE, getConfig } from './config.js';
import { runCommands, getCurrentCommitId } from './cmd.js';
import logger from './logger.js';
import { rm, copyDir } from './utils.js';

async function checkReleaseBranch(currentBranch, releaseBranch, devBranch) {
  const { debug, main, release } = getConfig();

  if (releaseBranch === release) {
    if (currentBranch === main) {
      devBranch = devBranch === NO_NEED_TO_MERGE ? '' : devBranch;

      if (devBranch) {
        try {
          await runCommands(`git merge --no-ff origin/${devBranch}`, {
            debug,
            justRun: true
          });
        } catch (e) {
          await runCommands(`git merge --no-ff ${devBranch}`, { debug });
        } finally {
          await runCommands(`git push origin ${main}`, { debug });
        }
      }
    } else {
      logger.fatal(
        `If you want to release '${release}', switch to the '${main}' branch first!`
      );
    }
  }
}

async function clean(releaseDir) {
  await rm(releaseDir);
  await runCommands('git worktree prune');
}

async function buildReleaseBranch(
  currentBranch,
  releaseBranch,
  releaseScript,
  logMessage
) {
  const { debug, projectName, buildDir } = getConfig();
  const releaseDir = path.join(cwd(), WORKSPACE_DIR);

  // Clean up
  clean(WORKSPACE_DIR);

  // New worktree
  const createCommands = [
    'git remote prune origin',
    'git pull --ff-only',
    `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`
  ];
  await runCommands(createCommands, { debug });
  await rm([`${WORKSPACE_DIR}/**`, `!${WORKSPACE_DIR}`]);

  // Build
  await runCommands(`npm run ${releaseScript}`, { debug });
  copyDir(buildDir, releaseDir, (err) => {
    logger.fatal(err);
  });

  // Release
  const commitId = await getCurrentCommitId(currentBranch);
  const LOG_MESSAGE =
    logMessage ||
    `build: ${projectName} from ${currentBranch} as of ${commitId}`;
  const releaseCommand = [
    'git status',
    'git add -A',
    `git commit -m "${LOG_MESSAGE}"`,
    `git push -f -u origin ${releaseBranch}`
  ];
  await runCommands(releaseCommand, { debug, cwd: releaseDir });

  // Clean up
  clean(WORKSPACE_DIR);
}

async function deployProject({
  currentBranch,
  releaseBranch,
  releaseScript,
  devBranch,
  logMessage
}) {
  await checkReleaseBranch(currentBranch, releaseBranch, devBranch);
  await buildReleaseBranch(
    currentBranch,
    releaseBranch,
    releaseScript,
    logMessage
  );
}

export default deployProject;
