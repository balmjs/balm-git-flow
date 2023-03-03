#!/usr/bin/env node
import inquirer from 'inquirer';
import setEnvironment from '../lib/env.js';
import { getConfig } from '../lib/config.js';
import deployProject from '../lib/deploy.js';

async function production() {
  await setEnvironment();

  const releases = getConfig('releases');

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'releaseBranch',
        message: 'Please select the branch of production:',
        choices: releases
      },
      {
        type: 'confirm',
        name: 'ok',
        message: ({ releaseBranch }) =>
          `Determine the release ${releaseBranch}?`
      }
    ])
    .then(({ releaseBranch, ok }) => ok && deployProject(releaseBranch));
}

production();
