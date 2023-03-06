import path from 'node:path';
import fs from 'node:fs';
import { setConfig } from './config.js';
import logger from './logger.js';
import { writeIterableToFile } from './utils.js';
import { init } from './branch.js';

const balmEnvFile = path.join(process.cwd(), 'balm.env.js');
const defaultContents = [
  `process.env.BALM_GIT_FLOW_NAME = '';`,
  `process.env.BALM_GIT_FLOW_MAIN = 'main';`,
  `process.env.BALM_GIT_FLOW_RELEASE = 'release';`,
  `process.env.BALM_GIT_FLOW_RELEASES = ['release'];`,
  `process.env.BALM_GIT_FLOW_SCRIPTS = ['build'];`,
  `process.env.BALM_GIT_FLOW_BUILD_DIR = 'dist';`
];

export async function setEnvironment(checkEnvFile = false) {
  if (fs.existsSync(balmEnvFile)) {
    await import(balmEnvFile);
    setConfig();

    checkEnvFile && init();
  } else {
    if (checkEnvFile) {
      await writeIterableToFile(defaultContents, balmEnvFile);

      logger.success(`'balm.env.js' has been created`);

      setEnvironment(true);
    } else {
      logger.fatal(`Missing 'balm.env.js' in the project root directory`);
    }
  }
}
