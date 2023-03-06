#!/usr/bin/env node
const inquirer = require('inquirer');
const { setEnvironment } = require('../lib/env.js');
const { getConfig } = require('../lib/config.js');
const {
  getCurrentBranch,
  getDevelopmentBranches,
  deployProject
} = require('../lib/deploy.js');

async function production() {
  await setEnvironment();

  const { main, release, releases, scripts } = getConfig();
  const currentBranch = await getCurrentBranch();
  const devBranches = await getDevelopmentBranches();

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'releaseBranch',
        message: 'Please select the branch of production:',
        choices: releases
      },
      {
        type: 'list',
        name: 'devBranch',
        message: 'Please select the branch of development:',
        choices: devBranches,
        when: ({ releaseBranch }) =>
          currentBranch === main && releaseBranch === release
      },
      {
        type: 'list',
        name: 'releaseScript',
        message: 'Please select the command of npm-run-script:',
        default: ({ releaseBranch }) => {
          const index = releases.indexOf(releaseBranch);
          return scripts[index];
        },
        choices: scripts,
        when: scripts.length
      },
      {
        type: 'confirm',
        name: 'ok',
        message: ({ releaseBranch, releaseScript }) => {
          let msg = `Determine the release '${releaseBranch}' branch`;
          if (releaseScript) {
            msg += `using the '${releaseScript}' command`;
          }
          return `${msg}?`;
        }
      },
      {
        type: 'input',
        name: 'logMessage',
        message: 'Please input the release log message:'
      }
    ])
    .then(
      (answers) =>
        answers.ok &&
        deployProject({
          currentBranch,
          ...answers
        })
    );
}

production();
