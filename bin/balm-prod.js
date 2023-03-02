#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import setEnvironment from '../lib/env.js';
import deployProject from '../lib/deploy.js';

const program = new Command();

async function production() {
  await setEnvironment();

  // TODO
}

production();
