import { getConfig } from './config.js';
import {
  execCommand,
  runCommands,
  getCurrentBranch,
  getRemoteBranches
} from './cmd.js';
import logger from './logger.js';

async function createEmptyBranch(newBranch) {
  const createCommands = [
    `git checkout --orphan ${newBranch}`,
    'git rm -rf .',
    `git commit --allow-empty -m "Initial commit for ${newBranch}"`,
    `git push origin ${newBranch}`
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
        await createEmptyBranch(releaseBranch);
      }
    }
    const message = isOK ? 'Everything is OK' : 'New branch has been created';
    logger.success(message);

    !isOK && (await execCommand(`git checkout ${currentBranch}`));
  }
}

export async function createDevBranch(newBranch, startPoint) {
  const main = getConfig('main');
  startPoint = startPoint || `origin/${main}`;

  await execCommand(`git checkout -b ${newBranch} ${startPoint}`);
}
