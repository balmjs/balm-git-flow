#!/usr/bin/env node
import { argv } from 'node:process';
import { Command } from 'commander';
import chalk from 'chalk';
import setEnvironment from '../lib/env.js';
import { createDevBranch } from '../lib/branch.js';

const program = new Command();

/**
 * Usage
 */

program
  .argument('<new-branch>', 'name of the new development branch')
  .argument('[start-point]', 'branch to start from (defaults to origin main)');

/**
 * Help
 */

program.on('--help', () => {
  console.log('  Examples:');
  console.log();
  console.log(chalk.gray('    # create a new branch from origin main branch'));
  console.log('    $ balm-git dev dev-xxx');
  console.log();
  console.log(chalk.gray('    # create a new branch from custom branch'));
  console.log('    $ balm-git dev dev-xxx custom-branch');
  console.log();
});

function help() {
  program.parse(argv);
  if (program.args.length < 1) return program.help();
}

help();

/**
 * Settings
 */
async function development() {
  await setEnvironment();

  const [newBranch, startPoint] = program.args;
  createDevBranch(newBranch, startPoint);
}

development();
