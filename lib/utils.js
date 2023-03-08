import { EOL } from 'node:os';
import util from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
import { once } from 'node:events';

// Define regular expression
const reTypeOf = /(?:^\[object\s(.*?)\]$)/;
const REGEX_STAR = /^(\*|\+)?\s*(origin\/)?/g;

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
