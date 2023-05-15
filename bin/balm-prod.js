#!/usr/bin/env node
const inquirer = require('inquirer');
const { setEnvironment } = require('../lib/env.js');
const { getConfig } = require('../lib/config.js');
const { getCurrentBranch, getDevelopmentBranches } = require('../lib/cmd.js');
const { deployProject } = require('../lib/deploy.js');
const { fatal } = require('../lib/logger.js');

async function production() {
  await setEnvironment();

  const { main, release, releases, scripts, releaseScripts, useCustomMessage } =
    getConfig();

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
          !releaseScripts &&
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
      switch (scripts.length) {
        case 1:
          answers.releaseScript = scripts[0];
          break;
        case releases.length:
          const index = releases.indexOf(releaseBranch);
          answers.releaseScript = scripts[index];
          break;
        default:
          for (let i = 0, len = scripts.length; i < len; i++) {
            const script = scripts[i];
            if (releaseScripts[script].includes(releaseBranch)) {
              answers.releaseScript = script;
              break;
            }
          }
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
