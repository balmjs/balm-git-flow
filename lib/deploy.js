import util from 'node:util';
import { exec } from 'node:child_process';
import { getConfig } from './config.js';
import logger from './logger.js';

const asyncExec = util.promisify(exec);

async function checkReleaseBranch(releaseBranch) {
  const { main, release } = getConfig();

  const { stdout } = await asyncExec('git symbolic-ref --short -q HEAD');

  if (releaseBranch === release && stdout !== main) {
    logger.fatal(
      `If you want to release '${release}', switch to the '${main}' branch first`
    );
  }
}

async function deployProject(releaseBranch) {
  checkReleaseBranch(releaseBranch);

  console.log('gg');
  // git checkout main
  // git merge --no-ff ${name}
}

export default deployProject;
