import {
  RELEASE_DIR,
  releaseDir,
  getConfig,
  NO_NEED_TO_MERGE
} from './config.js';
import { runCommands, clean, checkStatus, getCurrentCommitId } from './cmd.js';
import logger from './logger.js';
import { rm, copyDir } from './utils.js';

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

async function publishingFromSource(releaseBranch) {
  const { debug, releases, repositories, site } = getConfig();

  if (repositories.length) {
    const releaseIndex = releases.indexOf(releaseBranch);
    const repository = repositories[releaseIndex] || repositories[0];
    const branch = `${releaseBranch}:${site || releaseBranch}`;

    const publishingCommands = `git push -f ${repository} ${branch}`;
    await runCommands(publishingCommands, {
      cwd: releaseDir,
      useClean: true,
      debug
    });
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
    // 'git remote prune origin',
    // 'git pull --ff-only',
    `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`
  ];
  await runCommands(createCommands, { useClean: true, debug });
  await rm([`${RELEASE_DIR}/**`, `!${RELEASE_DIR}`]);

  // Build
  await runCommands(`npm run ${releaseScript}`, { useClean: true, debug });
  copyDir(buildDir, releaseDir, () => {});

  // Release
  const hasUncommitted = await checkStatus({
    cwd: releaseDir
  });
  if (hasUncommitted) {
    const commitId = await getCurrentCommitId(currentBranch);
    const LOG_MESSAGE =
      logMessage ||
      `build: ${releaseBranch} from ${currentBranch} as of ${commitId}`;

    const releaseCommand = [
      'git status'
      // 'git add -A',
      // `git commit -m "${LOG_MESSAGE}"`
      // `git push -f origin ${releaseBranch}`
    ];
    await runCommands(releaseCommand, {
      cwd: releaseDir,
      useClean: true,
      debug
    });
    await publishingFromSource(releaseBranch);

    // Clean up
    await clean('Release completed');
  } else {
    await clean('Release unchanged');
  }
}

export async function deployProject({
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
