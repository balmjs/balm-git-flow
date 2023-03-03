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
  for await (const command of awesomeCommand) {
    debug && console.log(command);

    const { error, stdout } = await asyncExec(command, options || {});
    if (error) {
      logger.fatal(error);
    } else {
      console.log(stdout);
    }
  }
}
