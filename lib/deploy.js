import util from 'node:util';
import { exec } from 'node:child_process';
import { WORKSPACE_DIR, NO_NEED_TO_MERGE, getConfig } from './config.js';
import logger from './logger.js';
import { parseBranchLines } from './utils.js';

const asyncExec = util.promisify(exec);

export async function getCurrentBranch() {
  const { stdout } = await asyncExec('git symbolic-ref --short -q HEAD');
  const currentBranch = stdout.trim();

  return currentBranch;
}

async function checkReleaseBranch(releaseBranch, devBranch) {
  const { debug, main, release } = getConfig();
  const currentBranch = await getCurrentBranch();

  if (releaseBranch === release) {
    if (currentBranch === main) {
      devBranch = devBranch === NO_NEED_TO_MERGE ? '' : devBranch;

      if (devBranch) {
        let command = '';
        try {
          command = `git merge --no-ff origin/${devBranch}`;
        } catch (e) {
          command = `git merge --no-ff ${devBranch}`;
        } finally {
          await asyncExec(command);
          debug && logger.log(command);
        }
      }
    } else {
      logger.fatal(
        `If you want to release '${release}', switch to the '${main}' branch first!`
      );
    }
  }
}

async function buildReleaseBranch(releaseBranch, releaseScript) {
  const workDir = `${WORKSPACE_DIR}/${releaseBranch}`;

  await asyncExec('git remote prune origin');
  await asyncExec(
    `git worktree add -B ${releaseBranch} ${workDir} origin/${releaseBranch}`
  );
  await asyncExec(`cd ${workDir}`);
}

export async function deployProject({
  releaseBranch,
  releaseScript,
  devBranch
}) {
  await checkReleaseBranch(releaseBranch, devBranch);
  // await buildReleaseBranch(releaseBranch, releaseScript);
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
