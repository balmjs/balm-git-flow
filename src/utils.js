import { EOL } from 'node:os';
import util from 'node:util';
import { exec } from 'node:child_process';
import stream from 'node:stream';
import fs from 'node:fs';
import { once } from 'node:events';
import logger from './logger.js';

// Define regular expression
const reTypeOf = /(?:^\[object\s(.*?)\]$)/;
const REGEX_STAR = /^(\*)?\s*(origin\/)?/g;
const ENTER = '\n';

const asyncExec = util.promisify(exec);
const finished = util.promisify(stream.finished);

const getType = (any) => {
  return Object.prototype.toString
    .call(any)
    .replace(reTypeOf, '$1')
    .toLowerCase();
};

export const isObject = (obj) => getType(obj) === 'object';

export const parseBranchLines = (str) => {
  let branches = str.trim().split(EOL);

  if (branches[0].includes(ENTER)) {
    branches = str.trim().split(ENTER);
  }

  return branches.map((line) => line.trim().replace(REGEX_STAR, ''));
};

export async function runCommand(awesomeCommand, cmdOptions = {}) {
  const { debug, ...options } = cmdOptions;

  if (Array.isArray(awesomeCommand)) {
    for await (const command of awesomeCommand) {
      debug && console.log(command);

      try {
        const { stdout } = await asyncExec(command, options || {});
        console.log(stdout);
      } catch (error) {
        logger.fatal(error);
      }
    }
  } else {
    debug && console.log(awesomeCommand);

    const { stdout } = await asyncExec(awesomeCommand, options || {});
    console.log(stdout);
  }
}

export async function writeIterableToFile(iterable, filePath) {
  const writable = fs.createWriteStream(filePath, { encoding: 'utf8' });
  for await (const chunk of iterable) {
    if (!writable.write(`${chunk}\n`)) {
      // Handle backpressure
      await once(writable, 'drain');
    }
  }
  writable.end();
  // Wait until done. Throws if there are errors.
  await finished(writable);
}
