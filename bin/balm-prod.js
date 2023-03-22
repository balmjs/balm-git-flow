#!/usr/bin/env node
import inquirer from 'inquirer';
import setEnvironment from '../lib/env.js';
import { getConfig } from '../lib/config.js';
import { getCurrentBranch, getDevelopmentBranches } from '../lib/cmd.js';
import deployProject from '../lib/deploy.js';
import logger from '../lib/logger.js';

async function production() {
  await setEnvironment();

  const { main, release, releases, scripts } = getConfig();

  const prompt = inquirer.createPromptModule();
  const { releaseBranch } = await prompt([
    {
      type: 'list',
      name: 'releaseBranch',
      message: 'Please select the production branch:',
      choices: releases
    }
  ]);

  const currentBranch = await getCurrentBranch();
  const canRelease = release.includes(releaseBranch)
    ? currentBranch === main
    : true;

  if (canRelease) {
    const devBranches = await getDevelopmentBranches();

    prompt([
      {
        type: 'list',
        name: 'devBranch',
        message: 'Please select the development branch to be merged:',
        choices: devBranches,
        when: release.includes(releaseBranch) && currentBranch === main
      },
      {
        type: 'list',
        name: 'releaseScript',
        message: 'Please select the command of npm-run-script:',
        default: () => {
          const index = releases.indexOf(releaseBranch);
          return scripts[index];
        },
        choices: scripts
      },
      {
        type: 'confirm',
        name: 'ok',
        message: ({ releaseScript }) => {
          let msg = `Determine the release '${releaseBranch}' branch`;
          if (releaseScript) {
            msg += ` using the '${releaseScript}' command`;
          }
          return `${msg}?`;
        }
      },
      {
        type: 'input',
        name: 'logMessage',
        message: 'Please input the release log message:'
      }
    ]).then(
      (answers) =>
        answers.ok &&
        deployProject({
          currentBranch,
          releaseBranch,
          ...answers
        })
    );
  } else {
    logger.fatal(
      `If you want to release '${releaseBranch}', switch to the '${main}' branch first!`
    );
  }
}

production();
