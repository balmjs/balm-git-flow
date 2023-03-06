#!/usr/bin/env node
const { setEnvironment } = require('../lib/env.js');

async function doctor() {
  await setEnvironment(true);
}

doctor();
