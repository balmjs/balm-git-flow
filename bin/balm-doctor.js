#!/usr/bin/env node
import setEnvironment from '../lib/env.js';

function doctor() {
  setEnvironment(true);
}

doctor();
