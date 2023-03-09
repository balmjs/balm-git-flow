import util from 'node:util';
import { exec } from 'node:child_process';
import logger from './logger.js';
import { NO_NEED_TO_MERGE, getConfig } from './config.js';
import { parseBranchLines } from './utils.js';

const asyncExec = util.promisify(exec);

export async function execCommand(command) {
  let result;

  try {
    const { stdout } = await asyncExec(command);
    result = stdout.trim();
  } catch (error) {
    logger.fatal(error);
  }

  return result;
}

async function runCommand(command, cmdOptions) {
  const { debug, justRun, ...options } = cmdOptions;

  debug && console.log(command);

  if (justRun) {
    const { stdout } = await asyncExec(command, options || {});
    console.log(stdout);
  } else {
    try {
      const { stdout } = await asyncExec(command, options || {});
      console.log(stdout);
    } catch (error) {
      logger.fatal(error);
    }
  }
}

export async function runCommands(awesomeCommand, cmdOptions = {}) {
  if (Array.isArray(awesomeCommand)) {
    for await (const command of awesomeCommand) {
      await runCommand(command, cmdOptions);
    }
  } else {
    await runCommand(awesomeCommand, cmdOptions);
  }
}

export async function getCurrentBranch() {
  return await execCommand('git symbolic-ref --short -q HEAD');
}

export async function getCurrentCommitId(currentBranch) {
  return await execCommand(`git log -1 --pretty=format:%h ${currentBranch}`);
}

export async function getRemoteBranches(filterHeadCommand) {
  const { error, stdout } = await asyncExec(
    `git branch -r | ${filterHeadCommand}`
  );
  if (error) {
    logger.fatal(error);
  }

  return stdout ? parseBranchLines(stdout) : false;
}

export async function getDevelopmentBranches() {
  const { main, releases } = getConfig();

  const localBranches = await execCommand('git branch');
  let devBranches = parseBranchLines(localBranches).filter(
    (branch) => !(branch === main || releases.includes(branch))
  );
  devBranches.unshift(NO_NEED_TO_MERGE);

  return devBranches;
}
