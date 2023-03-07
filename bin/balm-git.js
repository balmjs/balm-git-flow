#!/usr/bin/env node
import { createRequire } from 'node:module';
import { Command } from 'commander';

const requireModule = createRequire(import.meta.url);
const pkg = requireModule('../package.json');
const program = new Command();

const version = `balm-git-flow: ${pkg.version}`;

program
  .version(version)
  .usage('<command> [options]')
  .command('doctor', 'check the project environment')
  .command('dev', 'create new branch for development from origin main branch')
  .command('prod', 'release process');

program.parse(process.argv);
