export const WORKSPACE_DIR = '.balm-git-flow';
export const NO_NEED_TO_MERGE = '[No need to merge]';

const defaultOptions = {
  main: 'main',
  release: 'release',
  releases: ['release'],
  scripts: [],
  buildDir: 'dist'
};

let options = {};

export function setConfig() {
  options = {
    debug: process.env.BALM_GIT_FLOW_DEBUG || false,
    projectName: process.env.BALM_GIT_FLOW_NAME || 'project',
    main: process.env.BALM_GIT_FLOW_MAIN || defaultOptions.main,
    release: process.env.BALM_GIT_FLOW_RELEASE || defaultOptions.release,
    releases: process.env.BALM_GIT_FLOW_RELEASES
      ? process.env.BALM_GIT_FLOW_RELEASES.split(',')
      : defaultOptions.releases,
    scripts: process.env.BALM_GIT_FLOW_SCRIPTS
      ? process.env.BALM_GIT_FLOW_SCRIPTS.split(',')
      : defaultOptions.scripts,
    buildDir: process.env.BALM_GIT_FLOW_BUILD_DIR || defaultOptions.buildDir
  };
}

export function getConfig(key) {
  return options[key] || options;
}
