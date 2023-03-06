import path from 'node:path';
import fs from 'node:fs';
import { setConfig } from './config.js';

const balmEnvFile = path.join(process.cwd(), 'balm.env.js');

async function setEnvironment(checkEnvFile = false) {
  if (fs.existsSync(balmEnvFile)) {
    await import(balmEnvFile);
    setConfig();
  } else {
    if (checkEnvFile) {
      const content = fs.createWriteStream(balmEnvFile, { flags: 'a' });
      content.write(`process.env.BALM_GIT_FLOW_NAME = '';`);
      content.write(`process.env.BALM_GIT_FLOW_MAIN = 'main';`);
      content.write(`process.env.BALM_GIT_FLOW_RELEASE = 'release';`);
      content.write(`process.env.BALM_GIT_FLOW_RELEASES = ['release'];`);
      content.write(`process.env.BALM_GIT_FLOW_SCRIPTS = ['build'];`);
      content.write(`process.env.BALM_GIT_FLOW_SCRIPTS = 'dist';`);
    } else {
      throw new Error(`Missing 'balm.env.js' in the project root directory`);
    }
  }
}

export default setEnvironment;
