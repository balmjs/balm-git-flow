import { deepMerge } from './utils.js';

const defaultOptions = {
  main: 'main', // `git symbolic-ref --short -q HEAD`
  release: 'release',
  releases: ['release'],
  scripts: []
};

let options = {};

export function setConfig() {
  options = {
    main: process.env.BALM_GIT_FLOW_MAIN || defaultOptions.main,
    release: process.env.BALM_GIT_FLOW_RELEASE || defaultOptions.release,
    releases: process.env.BALM_GIT_FLOW_RELEASES
      ? process.env.BALM_GIT_FLOW_RELEASES.split(',')
      : defaultOptions.releases,
    scripts: process.env.BALM_GIT_FLOW_SCRIPTS || defaultOptions.scripts
  };
}

export function getConfig(key) {
  return options[key] || options;
}
