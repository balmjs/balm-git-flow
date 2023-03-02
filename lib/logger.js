import { format } from 'node:util';
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
  const msg = format.apply(format, args);
  console.log(chalk.red(prefix), sep, msg);
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
