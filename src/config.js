import path from 'node:path';
import { cwd, env } from 'node:process';

export const RELEASE_DIR = '.balm-git-flow';
export const releaseDir = path.join(cwd(), RELEASE_DIR);

const defaultOptions = {
  main: 'main',
  release: 'release',
  releases: ['release'],
  scripts: ['build'],
  releaseScripts: false,
  buildDir: 'dist',
  ignoreUncommitted: false,
  useCustomMessage: false,
  repositories: [],
  site: ''
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
  const boolRegex = /^true$/i;

  const releaseScripts = env.BALM_GIT_FLOW_RELEASE_SCRIPTS
    ? JSON.parse(env.BALM_GIT_FLOW_RELEASE_SCRIPTS)
    : {};
  const releases = Object.values(releaseScripts).flat();
  const scripts = Object.keys(releaseScripts);

  options = {
    debug: env.BALM_GIT_FLOW_DEBUG || false,
    main: env.BALM_GIT_FLOW_MAIN || defaultOptions.main,
    release: env.BALM_GIT_FLOW_RELEASE
      ? env.BALM_GIT_FLOW_RELEASE.split(',')
      : [defaultOptions.release],
    releases: env.BALM_GIT_FLOW_RELEASES
      ? env.BALM_GIT_FLOW_RELEASES.split(',')
      : releases || defaultOptions.releases,
    scripts: env.BALM_GIT_FLOW_SCRIPTS
      ? env.BALM_GIT_FLOW_SCRIPTS.split(',')
      : scripts || defaultOptions.scripts,
    releaseScripts,
    buildDir: env.BALM_GIT_FLOW_BUILD_DIR || defaultOptions.buildDir,
    ignoreUncommitted:
      boolRegex.test(env.BALM_GIT_FLOW_IGNORE_UNCOMMITTED) ||
      defaultOptions.ignoreUncommitted,
    useCustomMessage:
      boolRegex.test(env.BALM_GIT_FLOW_USE_CUSTOM_MESSAGE) ||
      defaultOptions.useCustomMessage,
    repositories: env.BALM_GIT_FLOW_REPOSITORIES
      ? env.BALM_GIT_FLOW_REPOSITORIES.split(',')
      : defaultOptions.repositories,
    site: env.BALM_GIT_FLOW_SITE || defaultOptions.site
  };
}

export function getConfig(key) {
  return options[key] || options;
}

export const NO_NEED_TO_MERGE = '[No need to merge]';
