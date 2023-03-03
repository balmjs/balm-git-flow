import util from 'node:util';
import { exec } from 'node:child_process';
import { getConfig } from './config.js';
import logger from './logger.js';
import { parseBranchLines } from './utils.js';

const asyncExec = util.promisify(exec);

export async function createDevBranch(newBranch, startPoint) {
  const main = getConfig('main');
  startPoint = startPoint || `origin/${main}`;

  const { error } = asyncExec(`git checkout -b ${newBranch} ${startPoint}`);
  if (error) {
    logger.fatal(error);
  }
}

async function createEmptyBranch(newBranch) {
  const { stdout } = await asyncExec('git branch');
  const [currentBranch] = parseBranchLines(stdout);

  await asyncExec(`git checkout --orphan ${newBranch}`);
  await asyncExec(`git rm -rf .`);
  await asyncExec(
    `git commit --allow-empty -m "Initial commit for ${newBranch}"`
  );
  await asyncExec(`git push origin ${newBranch}`);

  await asyncExec(`git checkout ${currentBranch}`);
}

export async function checkRemoteBranch() {
  const releases = getConfig('releases');

  const { error, stdout } = await asyncExec('git branch -r');
  if (error) {
    logger.fatal(error);
  }

  if (stdout) {
    const branches = parseBranchLines(stdout);

    let isOK = true;
    for await (const releaseBranch of releases) {
      if (!branches.includes(releaseBranch)) {
        isOK = false;
        logger.log(`Missing branch: '${releaseBranch}'`);
        await createEmptyBranch(releaseBranch);
      }
    }

    const message = isOK
      ? 'Everything is OK'
      : 'New branch(es) has been created';
    logger.success(message);
  }
}
