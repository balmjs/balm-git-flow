import chalk from 'chalk';
import { releaseDir, getConfig, NO_NEED_TO_MERGE } from './config.js';
import { runCommands, clean, checkStatus, getCurrentCommitId } from './cmd.js';
import logger from './logger.js';

async function checkReleaseBranch(currentBranch, releaseBranch, devBranch) {
  const { debug, main, release, ignoreUncommitted } = getConfig();

  await clean(false);
  const hasUncommitted = await checkStatus();
  if (hasUncommitted) {
    if (ignoreUncommitted) {
      await runCommands('git stash');
      logger.log(
        `You can use ${chalk.yellow(
          'git stash pop'
        )} to restore the latest status after release completed`
      );
    } else {
      logger.log(chalk.yellow('Local changes were not restored'));
      return false;
    }
  }

  if (release.includes(releaseBranch) && currentBranch === main) {
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
  }

  return true;
}

async function publishingFromSource(releaseBranch) {
  const { debug, releases, repositories, site } = getConfig();

  if (repositories.length) {
    const releaseIndex = releases.indexOf(releaseBranch);
    const repository = repositories[releaseIndex] || repositories[0];

    if (repository) {
      const branch = `${releaseBranch}:${site || releaseBranch}`;
      const publishingCommands = `git push -f ${repository} ${branch}`;
      await runCommands(publishingCommands, {
        cwd: releaseDir,
        useClean: true,
        releaseBranch,
        debug
      });
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
  await clean(false, 'Start building');

  // New worktree
  const createCommands = [
    'git remote prune origin',
    'git pull --ff-only',
    `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`,
    `rm -rf ${releaseDir}/*`
  ];
  await runCommands(createCommands, { useClean: true, releaseBranch, debug });

  // Build
  const buildCommands = [
    `npm run ${releaseScript}`,
    `cp -rf ${buildDir}/* ${releaseDir}`
  ];
  await runCommands(buildCommands, { useClean: true, releaseBranch, debug });

  // Release
  const hasUncommitted = await checkStatus({
    cwd: releaseDir
  });
  if (hasUncommitted) {
    const commitId = await getCurrentCommitId();
    const LOG_MESSAGE =
      logMessage || `${releaseBranch} from ${currentBranch} as of ${commitId}`;

    const releaseCommands = [
      'git status',
      'git add -A',
      `git commit -m "build: ${LOG_MESSAGE}"`,
      `git push -f origin ${releaseBranch}`
    ];
    await runCommands(releaseCommands, {
      cwd: releaseDir,
      useClean: true,
      releaseBranch,
      debug
    });
    await publishingFromSource(releaseBranch);

    // Clean up
    await clean(releaseBranch, 'Release completed');
  } else {
    await clean(releaseBranch, 'Release unchanged');
  }
}

async function deployProject({
  currentBranch,
  releaseBranch,
  releaseScript,
  devBranch,
  logMessage
}) {
  if (await checkReleaseBranch(currentBranch, releaseBranch, devBranch)) {
    await buildReleaseBranch(
      currentBranch,
      releaseBranch,
      releaseScript,
      logMessage
    );
  }
}

export default deployProject;
