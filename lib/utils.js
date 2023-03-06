import { EOL } from 'node:os';
import util from 'node:util';
import { exec } from 'node:child_process';
import logger from './logger.js';

// Define regular expression
const reTypeOf = /(?:^\[object\s(.*?)\]$)/;
const REGEX_STAR = /^(\*)?\s*(origin\/)?/g;

const asyncExec = util.promisify(exec);
const getType = (any) => {
  return Object.prototype.toString
    .call(any)
    .replace(reTypeOf, '$1')
    .toLowerCase();
};

export const isObject = (obj) => getType(obj) === 'object';

export const parseBranchLines = (str) =>
  str
    .trim()
    .split(EOL)
    .map((line) => line.trim().replace(REGEX_STAR, ''));

export async function runCommand(awesomeCommand, cmdOptions = {}) {
  const { debug, ...options } = cmdOptions;

  if (Array.isArray(awesomeCommand)) {
    for await (const command of awesomeCommand) {
      debug && console.log(command);

      try {
        const { stdout } = await asyncExec(command, options || {});
        console.log(stdout);
      } catch (error) {
        process.exit(1);
      }
    }
  } else {
    debug && console.log(awesomeCommand);

    const { stdout } = await asyncExec(awesomeCommand, options || {});
    console.log(stdout);
  }
}
