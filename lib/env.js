import path from 'node:path';
import fs from 'node:fs';
import { setConfig } from './config.js';

const balmEnvFile = path.join(process.cwd(), 'balm.env.js');

async function setEnvironment() {
  if (fs.existsSync(balmEnvFile)) {
    await import(balmEnvFile);
    setConfig();
  } else {
    throw new Error(`Missing 'balm.env.js' in the project root directory`);
  }
}

export default setEnvironment;
