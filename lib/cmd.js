import util from 'node:util';
import { exec } from 'node:child_process';
import logger from './logger.js';
import { releaseDir, getConfig, NO_NEED_TO_MERGE } from './config.js';
import { parseBranchLines } from './utils.js';

const asyncExec = util.promisify(exec);

export async function execCommand(command, options = {}) {
  let result;

  try {
    const { stdout } = await asyncExec(command, options);
    result = stdout.trim();
  } catch (error) {
    logger.fatal(error);
  }

  return result;
}

async function runCommand(command, cmdOptions) {
  const { debug, justRun, useClean, releaseBranch, ...options } = cmdOptions;

  debug && console.log(command);

  if (justRun) {
    const { stdout } = await asyncExec(command, options || {});
    console.log(stdout);
  } else {
    try {
      const { stdout } = await asyncExec(command, options || {});
      console.log(stdout);
    } catch (error) {
      useClean && (await clean(releaseBranch));
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

export async function clean(releaseBranch, message = '') {
  const cleanCommands = [
    `rm -rf ${releaseDir}`,
    'git worktree prune',
    `git branch -D ${releaseBranch}`
  ];
  await runCommands(cleanCommands);
  message && logger.log(message);
}

export async function checkStatus(options = {}) {
  const result = await execCommand('git status -s', options);
  return !!result.length;
}

export async function getCurrentBranch() {
  return await execCommand('git symbolic-ref --short -q HEAD');
}

export async function getRemoteBranches() {
  const remoteBranches = await execCommand('git branch -r | grep -v HEAD');
  return remoteBranches ? parseBranchLines(remoteBranches) : false;
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
