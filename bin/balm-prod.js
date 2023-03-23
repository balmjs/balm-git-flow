#!/usr/bin/env node
const inquirer = require('inquirer');
const { setEnvironment } = require('../lib/env.js');
const { getConfig } = require('../lib/config.js');
const { getCurrentBranch, getDevelopmentBranches } = require('../lib/cmd.js');
const { deployProject } = require('../lib/deploy.js');
const { fatal } = require('../lib/logger.js');

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
        message: 'Please select the branch of development:',
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
    fatal(
      `If you want to release '${releaseBranch}', switch to the '${main}' branch first!`
    );
  }
}

production();
