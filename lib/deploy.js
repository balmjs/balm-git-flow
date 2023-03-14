import { preReleaseDir, getConfig, NO_NEED_TO_MERGE } from './config.js';
import { runCommands } from './cmd.js';
import logger from './logger.js';

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

async function clean(message) {
  const cleanCommands = [`rm -rf ${preReleaseDir}`, 'git worktree prune'];
  await runCommands(cleanCommands);
  logger.log(message);
}

async function buildReleaseBranch(
  currentBranch,
  releaseBranch,
  releaseScript,
  logMessage
) {
  const { debug, buildDir } = getConfig();

  // Clean up
  await clean('Start building');

  // New worktree
  const createCommands = [
    'git remote prune origin',
    'git pull --ff-only',
    `git worktree add -B ${releaseBranch} ${preReleaseDir} origin/${releaseBranch}`,
    `rm -rf ${preReleaseDir}/*`
  ];
  await runCommands(createCommands, { debug });

  // Build
  const buildCommands = [
    `npm run ${releaseScript}`,
    `cp -rf ${buildDir}/* ${preReleaseDir}`
  ];
  await runCommands(buildCommands, { debug });

  // Release
  const LOG_MESSAGE =
    logMessage ||
    `build: ${releaseBranch} from ${currentBranch} as of $(git log -1 --pretty=format:%h ${currentBranch})`;
  const releaseCommands = [
    'git status',
    'git add -A',
    `git commit -m "${LOG_MESSAGE}"`,
    `git push -f -u origin ${releaseBranch}`
  ];
  await runCommands(releaseCommands, { debug, cwd: preReleaseDir });
}

async function deployProject({
  currentBranch,
  releaseBranch,
  releaseScript,
  devBranch,
  logMessage
}) {
  await checkReleaseBranch(currentBranch, releaseBranch, devBranch);

  try {
    await buildReleaseBranch(
      currentBranch,
      releaseBranch,
      releaseScript,
      logMessage
    );
  } finally {
    await clean('Release completed');
  }
}

export default deployProject;
