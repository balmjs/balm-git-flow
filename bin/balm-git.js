#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .usage('<command> [options]')
  .command('doctor', 'check the project environment')
  .command('dev', 'create new branch for development from origin main branch')
  .command('prod', 'release process');

program.parse(process.argv);
