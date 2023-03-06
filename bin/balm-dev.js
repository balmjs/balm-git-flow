#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const { setEnvironment } = require('../lib/env.js');
const { createDevBranch } = require('../lib/branch.js');

const program = new Command();

/**
 * Usage
 */

program.usage('<new-branch> [<start-point>]');

/**
 * Help
 */

program.on('--help', () => {
  console.log('  Examples:');
  console.log();
  console.log(chalk.gray('    # create a new branch from origin main branch'));
  console.log('    $ balm dev dev-xxx');
  console.log();
  console.log(chalk.gray('    # create a new branch from custom branch'));
  console.log('    $ balm dev dev-xxx custom-branch');
  console.log();
});

function help() {
  program.parse(process.argv);
  if (program.args.length < 1) return program.help();
}
help();

/**
 * Settings
 */
async function development() {
  await setEnvironment();

  const newBranch = program.args[0];
  const startPoint = program.args[1] || '';
  createDevBranch(newBranch, startPoint);
}

development();
