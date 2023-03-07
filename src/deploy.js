import util from 'node:util';
import { exec } from 'node:child_process';
import path from 'node:path';
import { WORKSPACE_DIR, NO_NEED_TO_MERGE, getConfig } from './config.js';
import logger from './logger.js';
import { parseBranchLines, runCommand, rm, copyDir } from './utils.js';

const asyncExec = util.promisify(exec);

export async function getCurrentBranch() {
  const { stdout } = await asyncExec('git symbolic-ref --short -q HEAD');
  const currentBranch = stdout.trim();

  return currentBranch;
}

export async function getCurrentCommitId(currentBranch) {
  const { stdout } = await asyncExec(
    `git log -1 --pretty=format:%h ${currentBranch}`
  );
  const currentCommitId = stdout.trim();

  return currentCommitId;
}

async function checkReleaseBranch(currentBranch, releaseBranch, devBranch) {
  const { debug, main, release } = getConfig();

  if (releaseBranch === release) {
    if (currentBranch === main) {
      devBranch = devBranch === NO_NEED_TO_MERGE ? '' : devBranch;

      if (devBranch) {
        try {
          await runCommand(`git merge --no-ff origin/${devBranch}`, {
            debug
          });
        } catch (e) {
          await runCommand(`git merge --no-ff ${devBranch}`, { debug });
        } finally {
          await runCommand(`git push origin ${main}`, { debug });
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
  await asyncExec('git worktree prune');
}

async function buildReleaseBranch(
  currentBranch,
  releaseBranch,
  releaseScript,
  logMessage
) {
  if (releaseScript) {
    const { debug, projectName, buildDir } = getConfig();
    const releaseDir = path.join(process.cwd(), WORKSPACE_DIR);

    // Clean up
    clean(WORKSPACE_DIR);

    // New worktree
    const createCommand = [
      'git remote prune origin',
      'git pull --ff-only',
      `git worktree add -B ${releaseBranch} ${releaseDir} origin/${releaseBranch}`
    ];
    await runCommand(createCommand, { debug });
    await rm([`${WORKSPACE_DIR}/**`, `!${WORKSPACE_DIR}`]);

    // Build
    await runCommand(`npm run ${releaseScript}`, { debug });
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
    await runCommand(releaseCommand, { cwd: releaseDir, debug });

    // Clean up
    clean(WORKSPACE_DIR);
  } else {
    logger.fatal(`Missing 'BALM_GIT_FLOW_SCRIPTS' in balm.env.js`);
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

export async function getDevelopmentBranches() {
  const { main, releases } = getConfig();

  const { stdout } = await asyncExec('git branch');
  let localBranches = parseBranchLines(stdout).filter(
    (branch) => !(branch === main || releases.includes(branch))
  );
  localBranches.unshift(NO_NEED_TO_MERGE);

  return localBranches;
}
