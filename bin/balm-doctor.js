#!/usr/bin/env node
import setEnvironment from '../lib/env.js';
import { checkRemoteBranch } from '../lib/branch.js';

async function doctor() {
  await setEnvironment();

  checkRemoteBranch();
}

doctor();
