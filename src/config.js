import path from 'node:path';
import { cwd, env } from 'node:process';

export const RELEASE_DIR = '.balm-git-flow';
export const releaseDir = path.join(cwd(), RELEASE_DIR);

const defaultOptions = {
  main: 'main',
  release: 'release',
  releases: ['release'],
  scripts: ['build'],
  buildDir: 'dist'
};

export const defaultContents = [
  `process.env.BALM_GIT_FLOW_MAIN = 'main';`,
  `process.env.BALM_GIT_FLOW_RELEASE = 'release';`,
  `process.env.BALM_GIT_FLOW_RELEASES = ['release'];`,
  `process.env.BALM_GIT_FLOW_SCRIPTS = ['build'];`,
  `process.env.BALM_GIT_FLOW_BUILD_DIR = 'dist';`
];

let options = {};

export function setConfig() {
  options = {
    debug: env.BALM_GIT_FLOW_DEBUG || false,
    main: env.BALM_GIT_FLOW_MAIN || defaultOptions.main,
    release: env.BALM_GIT_FLOW_RELEASE || defaultOptions.release,
    releases: env.BALM_GIT_FLOW_RELEASES
      ? env.BALM_GIT_FLOW_RELEASES.split(',')
      : defaultOptions.releases,
    scripts: env.BALM_GIT_FLOW_SCRIPTS
      ? env.BALM_GIT_FLOW_SCRIPTS.split(',')
      : defaultOptions.scripts,
    buildDir: env.BALM_GIT_FLOW_BUILD_DIR || defaultOptions.buildDir
  };
}

export function getConfig(key) {
  return options[key] || options;
}

export const NO_NEED_TO_MERGE = '[No need to merge]';
