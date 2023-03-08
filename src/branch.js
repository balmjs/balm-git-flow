import { getConfig } from './config.js';
import {
  execCommand,
  runCommands,
  getCurrentBranch,
  getRemoteBranches
} from './cmd.js';
import logger from './logger.js';

async function createEmptyBranch(newBranch) {
  const currentBranch = await getCurrentBranch();

  const createCommands = [
    `git checkout --orphan ${newBranch}`,
    'git rm -rf .',
    `git commit --allow-empty -m "Initial commit for ${newBranch}"`,
    `git push origin ${newBranch}`
  ];
  await runCommands(createCommands);

  execCommand(`git checkout ${currentBranch}`);
}

export async function init() {
  let remoteBranches;
  try {
    remoteBranches = await getRemoteBranches('grep -v HEAD');
  } catch (e) {
    remoteBranches = await getRemoteBranches('find /v "HEAD"');
  }

  if (remoteBranches) {
    const releases = getConfig('releases');
    let isOK = true;

    for await (const releaseBranch of releases) {
      if (!remoteBranches.includes(releaseBranch)) {
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

  execCommand(`git checkout -b ${newBranch} ${startPoint}`);
}
