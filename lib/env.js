import path from 'node:path';
import { cwd } from 'node:process';
import fs from 'node:fs';
import { defaultContents, setConfig } from './config.js';
import logger from './logger.js';
import { writeIterableToFile } from './utils.js';
import { init } from './branch.js';

const balmEnvFile = path.join(cwd(), 'balm.env.js');

async function setEnvironment(needInit = false) {
  if (fs.existsSync(balmEnvFile)) {
    await import(balmEnvFile);
    setConfig();

    needInit && init();
  } else {
    if (needInit) {
      await writeIterableToFile(defaultContents, balmEnvFile);

      logger.success(
        `'balm.env.js' has been created. After configuration, please re-run 'doctor' command`
      );
    } else {
      logger.fatal(
        `Missing 'balm.env.js' in the project root directory. Please run 'doctor' command first`
      );
    }
  }
}

export default setEnvironment;
