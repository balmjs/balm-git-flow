import { format } from 'node:util';
import { exit } from 'node:process';
import chalk from 'chalk';

/**
 * Prefix.
 */

const prefix = '[Balm Git Flow]';
const sep = chalk.gray('·');

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

function log(...args) {
  const msg = format.apply(format, args);
  console.log(chalk.white(prefix), sep, msg);
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

function fatal(...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim();
  const msg = format.apply(format, args);
  console.log(chalk.red(prefix), sep, msg);
  exit(1);
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

function success(...args) {
  const msg = format.apply(format, args);
  console.log(chalk.green(prefix), sep, msg);
}

export default { log, fatal, success };
