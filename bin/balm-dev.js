#!/usr/bin/env node
import { Command } from 'commander';
import setEnvironment from '../lib/env.js';
import { createDevBranch } from '../lib/branch.js';

const program = new Command();

/**
 * Usage
 */

program.usage('[branch-name]');

/**
 * Help
 */

program.on('--help', () => {
  console.log('  Examples:');
  console.log();
  console.log('    # create a new branch from main branch');
  console.log('    $ balm dev dev-xxx');
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

  const branchName = program.args[0];
  createDevBranch(branchName);
}

development();
