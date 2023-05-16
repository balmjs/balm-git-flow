#!/usr/bin/env node
const inquirer = require('inquirer');
const { setEnvironment } = require('../lib/env.js');
const { getConfig, getReleaseScript } = require('../lib/config.js');
const { getCurrentBranch, getDevelopmentBranches } = require('../lib/cmd.js');
const { deployProject } = require('../lib/deploy.js');
const { fatal } = require('../lib/logger.js');

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
        message: 'Please select the branch of development:',
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
    fatal(
      `If you want to release '${releaseBranch}', switch to the '${main}' branch first!`
    );
  }
}

production();
