import { EOL } from 'node:os';
import util from 'node:util';
import { exec } from 'node:child_process';
import stream from 'node:stream';
import fs from 'node:fs';
import { once } from 'node:events';
import path from 'node:path';
import del from 'del';
import logger from './logger.js';
import { isWin } from './config.js';

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

  if (isWin && branches[0].includes(ENTER)) {
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

export async function rm(dir, debug) {
  const deletedDir = await del(dir, { force: true });
  debug && logger.log(`Deleted dir: ${deletedDir}`);
}

/**
 * 复制文件夹到目标文件夹
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 * @param {function} callback 回调
 */
export function copyDir(src, dest, callback) {
  const copy = (copySrc, copyDest) => {
    fs.readdir(copySrc, (err, list) => {
      if (err) {
        callback(err);
        return;
      }
      list.forEach((item) => {
        const ss = path.resolve(copySrc, item);
        fs.stat(ss, (err, stat) => {
          if (err) {
            callback(err);
          } else {
            const curSrc = path.resolve(copySrc, item);
            const curDest = path.resolve(copyDest, item);

            if (stat.isFile()) {
              // 文件，直接复制
              fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest));
            } else if (stat.isDirectory()) {
              // 目录，进行递归
              fs.mkdirSync(curDest, { recursive: true });
              copy(curSrc, curDest);
            }
          }
        });
      });
    });
  };

  fs.access(dest, (err) => {
    if (err) {
      // 若目标目录不存在，则创建
      fs.mkdirSync(dest, { recursive: true });
    }
    copy(src, dest);
  });
}
