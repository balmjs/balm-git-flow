process.env.BALM_GIT_FLOW_DEBUG = true;

// Branch and scripts
process.env.BALM_GIT_FLOW_MAIN = 'legacy';
process.env.BALM_GIT_FLOW_RELEASE = 'release';
process.env.BALM_GIT_FLOW_RELEASES = ['test', 'release'];
process.env.BALM_GIT_FLOW_SCRIPTS = ['prod'];
// process.env.BALM_GIT_FLOW_RELEASE_SCRIPTS = JSON.stringify({
//   test: ['test-a', 'test-b'],
//   prod: ['release']
// });

// Files and directory
process.env.BALM_GIT_FLOW_BUILD_DIR = 'assets';
process.env.BALM_GIT_FLOW_REPOSITORIES = [
  'git@github.com:balmjs/balm-git-flow-test.git'
];
process.env.BALM_GIT_FLOW_IGNORE_UNCOMMITTED = false;
process.env.BALM_GIT_FLOW_USE_CUSTOM_MESSAGE = false;

// Remote
// process.env.BALM_GIT_FLOW_REPOSITORIES = [
//   'git@github.com:balmjs/balm-git-flow-test.git'
// ];
// process.env.BALM_GIT_FLOW_SITE = 'gh-pages';

function setBalmCore(useSource = false) {
  const BALM_ROOT = '/Users/elf-mouse/www/balmjs/balm';
  const BALM_CORE_SOURCE = `${BALM_ROOT}/packages/balm-core`;
  const BALM_CORE = '/usr/local/node_global/lib/node_modules/balm-core';

  process.env.BALM_CORE = useSource ? BALM_CORE_SOURCE : BALM_CORE;
}

setBalmCore(true);
