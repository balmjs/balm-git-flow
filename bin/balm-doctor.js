#!/usr/bin/env node
const { setEnvironment } = require('../lib/env.js');

function doctor() {
  setEnvironment(true);
}

doctor();
