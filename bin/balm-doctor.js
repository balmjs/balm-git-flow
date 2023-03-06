#!/usr/bin/env node
import setEnvironment from '../lib/env.js';
import { init } from '../lib/branch.js';

async function doctor() {
  await setEnvironment(true);

  init();
}

doctor();
