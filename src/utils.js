import { EOL } from 'node:os';
import util from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import del from 'del';
import { copy } from 'fs-extra';
import logger from './logger.js';

// Define regular expression
const reTypeOf = /(?:^\[object\s(.*?)\]$)/;
const REGEX_STAR = /^(\*)?\s*(origin\/)?/g;
const ENTER = '\n';

const getType = (any) => {
  return Object.prototype.toString
    .call(any)
    .replace(reTypeOf, '$1')
    .toLowerCase();
};

export const isObject = (obj) => getType(obj) === 'object';

export const parseBranchLines = (str) => {
  let branches = str.trim().split(EOL);

  // FIX: for windows terminal bug
  if (branches[0].includes(ENTER)) {
    branches = str.trim().split(ENTER);
  }

  return branches.map((line) => line.trim().replace(REGEX_STAR, ''));
};

const finished = util.promisify(stream.finished);

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

export async function rm(dir) {
  await del(dir, { force: true });
}

export async function cp(src, dest) {
  try {
    await copy(src, dest);
    logger.log('Build contents copied successfully');
  } catch (error) {
    logger.fatal(error);
  }
}
