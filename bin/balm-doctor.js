#!/usr/bin/env node
import setEnvironment from '../lib/env.js';

async function doctor() {
  await setEnvironment(true);
}

doctor();
