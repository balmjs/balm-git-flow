import { releaseDir, getConfig, NO_NEED_TO_MERGE } from './config.js';
import { runCommands, clean, checkStatus } from './cmd.js';
import logger from './logger.js';

async function checkReleaseBranch(currentBranch, releaseBranch, devBranch) {
  const { debug, main, release } = getConfig();

  const hasUncommitted = await checkStatus();
  if (hasUncommitted) {
    await runCommands('git stash');
    logger.log(
      `You can use 'git stash pop' to restore the latest status after release completed`
    );
  }

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
    `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`,
    `rm -rf ${releaseDir}/*`
  ];
  await runCommands(createCommands, { useClean: true, debug });

  // Build
  const buildCommands = [
    `npm run ${releaseScript}`,
    `cp -rf ${buildDir}/* ${releaseDir}`
  ];
  await runCommands(buildCommands, { useClean: true, debug });

  // Release
  const hasUncommitted = await checkStatus({
    cwd: releaseDir
  });
  if (hasUncommitted) {
    const LOG_MESSAGE =
      logMessage ||
      `build: ${releaseBranch} from ${currentBranch} as of $(git log -1 --pretty=format:%h ${currentBranch})`;

    const releaseCommands = [
      'git status',
      'git add -A',
      `git commit -m "${LOG_MESSAGE}"`,
      `git push -f -u origin ${releaseBranch}`
    ];
    await runCommands(releaseCommands, {
      cwd: releaseDir,
      useClean: true,
      debug
    });

    // Clean up
    await clean('Release completed');
  } else {
    await clean('Release unchanged');
  }
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
