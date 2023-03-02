import util from 'node:util';
import { exec } from 'node:child_process';
import { getConfig } from './config.js';
import logger from './logger.js';
import { parseBranchLines } from './utils.js';

const asyncExec = util.promisify(exec);

export async function createDevBranch(name) {
  const main = getConfig('main');

  const { error } = asyncExec(`git checkout -b ${name} origin/${main}`);
  if (error) {
    logger.fatal(error);
  }
}

async function createEmptyBranch(name) {
  const { stdout } = await asyncExec('git branch');
  const [currentBranch] = parseBranchLines(stdout);

  await asyncExec(`git checkout --orphan ${name}`);
  await asyncExec(`git rm -rf .`);
  await asyncExec(`git commit --allow-empty -m "Initial commit for ${name}"`);
  await asyncExec(`git push origin ${name}`);

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
        logger.fatal(`Missing branch: '${releaseBranch}'`);
        await createEmptyBranch(releaseBranch);
      }
    }

    const message = isOK ? 'Everything is OK' : 'New branch has been created';
    logger.success(message);
  }
}
