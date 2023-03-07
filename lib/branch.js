import util from 'node:util';
import { exec } from 'node:child_process';
import { getConfig } from './config.js';
import logger from './logger.js';
import { parseBranchLines, runCommand } from './utils.js';

const asyncExec = util.promisify(exec);

async function createEmptyBranch(newBranch) {
  const { stdout } = await asyncExec('git branch');
  const [currentBranch] = parseBranchLines(stdout);

  const createCommand = [
    `git checkout --orphan ${newBranch}`,
    'git rm -rf .',
    `git commit --allow-empty -m "Initial commit for ${newBranch}"`,
    `git push origin ${newBranch}`
  ];
  await runCommand(createCommand);

  await asyncExec(`git checkout ${currentBranch}`);
}

export async function init() {
  const releases = getConfig('releases');

  const { error, stdout } = await asyncExec('git branch -r | grep -v HEAD');
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

    const message = isOK ? 'Everything is OK' : 'New branch has been created';
    logger.success(message);
  }
}

export async function createDevBranch(newBranch, startPoint) {
  const main = getConfig('main');
  startPoint = startPoint || `origin/${main}`;

  const { error } = asyncExec(`git checkout -b ${newBranch} ${startPoint}`);
  if (error) {
    logger.fatal(error);
  }
}
