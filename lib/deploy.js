import path from 'node:path';
import { cwd } from 'node:process';
import { WORKSPACE_DIR, NO_NEED_TO_MERGE, getConfig } from './config.js';
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

async function clean(releaseDir) {
  const cleanCommands = [`rm -rf ${releaseDir}`, 'git worktree prune'];
  await runCommands(cleanCommands);
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
  clean(releaseDir);

  // New worktree
  const createCommands = [
    'git remote prune origin',
    'git pull --ff-only',
    `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`,
    `rm -rf ${releaseDir}/*`
  ];
  await runCommands(createCommands, { debug });

  // Build
  const buildCommands = [
    `npm run ${releaseScript}`,
    `cp -rf ${buildDir}/* ${releaseDir}`
  ];
  await runCommands(buildCommands, { debug });

  // Release
  const LOG_MESSAGE =
    logMessage ||
    `build: ${projectName} from ${currentBranch} as of $(git log -1 --pretty=format:%h ${currentBranch})`;
  const releaseCommands = [
    'git status',
    'git add -A',
    `git commit -m "${LOG_MESSAGE}"`,
    `git push -f -u origin ${releaseBranch}`
  ];
  await runCommands(releaseCommands, { debug, cwd: releaseDir });

  // Clean up
  clean(releaseDir);
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
