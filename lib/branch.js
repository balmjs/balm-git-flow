import { getConfig } from './config.js';
import {
  execCommand,
  runCommands,
  getCurrentBranch,
  getRemoteBranches
} from './cmd.js';
import logger from './logger.js';

async function createEmptyBranch(newBranch, currentBranch) {
  const createCommands = [
    `git checkout --orphan ${newBranch}`,
    'git rm -rf .',
    `git commit --allow-empty -m "Initial commit for ${newBranch}"`,
    `git push origin ${newBranch}`,
    `git checkout ${currentBranch}`,
    `git branch -D ${newBranch}`
  ];
  await runCommands(createCommands);
}

export async function init() {
  const remoteBranches = await getRemoteBranches();
  if (remoteBranches) {
    const currentBranch = await getCurrentBranch();
    const releases = getConfig('releases');
    let isOK = true;

    for await (const releaseBranch of releases) {
      if (!remoteBranches.includes(releaseBranch)) {
        isOK = false;
        logger.log(`Missing branch: '${releaseBranch}'`);
        await createEmptyBranch(releaseBranch, currentBranch);
      }
    }

    const message = isOK ? 'Everything is OK' : 'New branch has been created';
    logger.success(message);
  }
}

export async function createDevBranch(newBranch, startPoint) {
  const main = getConfig('main');
  startPoint = startPoint || `origin/${main}`;

  await execCommand(`git checkout -b ${newBranch} ${startPoint}`);
}
