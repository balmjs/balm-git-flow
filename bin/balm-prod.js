#!/usr/bin/env node
import inquirer from 'inquirer';
import setEnvironment from '../lib/env.js';
import { getConfig, getReleaseScript } from '../lib/config.js';
import { getCurrentBranch, getDevelopmentBranches } from '../lib/cmd.js';
import deployProject from '../lib/deploy.js';
import logger from '../lib/logger.js';

async function production() {
  await setEnvironment();

  const config = getConfig();
  const { main, release, releases, scripts, releaseScripts, useCustomMessage } =
    config;

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
    const releaseScript = getReleaseScript(releaseBranch, config);

    prompt([
      {
        type: 'list',
        name: 'devBranch',
        message: 'Please select the development branch to be merged:',
        choices: devBranches,
        when:
          release.includes(releaseBranch) &&
          currentBranch === main &&
          devBranches.length > 1
      },
      {
        type: 'list',
        name: 'releaseScript',
        message: 'Please select the command of npm-run-script:',
        choices: scripts,
        when:
          !releaseScript &&
          scripts.length > 1 &&
          scripts.length !== releases.length
      },
      {
        type: 'input',
        name: 'logMessage',
        message: '(Optional) Please input the release log message:',
        when: useCustomMessage
      }
    ]).then((answers) => {
      if (!answers.releaseScript) {
        answers.releaseScript = releaseScript;
      }

      deployProject({
        currentBranch,
        releaseBranch,
        ...answers
      });
    });
  } else {
    logger.fatal(
      `If you want to release '${releaseBranch}', switch to the '${main}' branch first!`
    );
  }
}

production();
