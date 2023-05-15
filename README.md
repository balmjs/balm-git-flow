# Balm Git Flow

> The best practices for front-end git flow

## Features

- One install, unified development process for all git projects
- Relatively simple release initialization
- Easy to configure and publish multiple environment branches
- Support for publishing independent repositories

## Workflow

1. main(source code) -> dev(feat, fix...) -> prod(test, pre-production...)
2. main(source code) -> prod(production)

## Requirements

1. [Node.js](https://nodejs.org/) >=12.20.0 (>=14.18.0 on Windows)
2. [Git](https://git-scm.com/) 2.6.0+

## Installation

```sh
npm install -g balm-git-flow
```

> ⚠️ NOTE: For Windows users, use `npm install -g balm-git-flow@legacy`

## Configuration

First, create a **`balm.env.js`** file in your project root directory (use `balm-git doctor`)

| Variable Name                    | Type              | Default              | Description                                                                                        |
| -------------------------------- | ----------------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| BALM_GIT_FLOW_MAIN               | `string`          | `'main'`             | main branch (source code)                                                                          |
| BALM_GIT_FLOW_RELEASE            | `string`, `array` | `'release'`          | production release branch(es)                                                                      |
| BALM_GIT_FLOW_RELEASES           | `array`           | `['release']`        | all release branches                                                                               |
| BALM_GIT_FLOW_SCRIPTS            | `array`           | `['build']`          | all build scripts corresponding to the release branches ( the keys of `scripts` in `package.json`) |
| BALM_GIT_FLOW_RELEASE_SCRIPTS    | `string`          | `JSON.stringify({})` | associated scripts and release branches (`{ [script: string]: [releases: string[]] }`)             |
| BALM_GIT_FLOW_BUILD_DIR          | `string`          | `'dist'`             | build out dir (by `npm-run-script`)                                                                |
| BALM_GIT_FLOW_IGNORE_UNCOMMITTED | `boolean`         | `false`              | ignore uncommitted for workflow                                                                    |
| BALM_GIT_FLOW_USE_CUSTOM_MESSAGE | `boolean`         | `false`              | use custom log message                                                                             |
| BALM_GIT_FLOW_REPOSITORIES       | `array`           |                      | independent repositories                                                                           |
| BALM_GIT_FLOW_SITE               | `string`          |                      | production release branch for independent repositories                                             |

- release scripts settings

  - Method 1:

    ```ini
    BALM_GIT_FLOW_RELEASES = ['test', 'release'];
    BALM_GIT_FLOW_SCRIPTS = ['build:test', 'build:release'];
    ```

  - Method 2:

    ```js
    BALM_GIT_FLOW_RELEASE_SCRIPTS = JSON.stringify({
      'build:test': ['test-a', 'test-b'],
      'build:release': ['release']
    });
    ```

## Usage

- `balm-git doctor`: check the project environment
- `balm-git dev <new-branch> [<start-point>]`: create new branch for development from origin main branch
- `balm-git prod`: release process

> ⚠️ NOTE: For Windows users, use `balm-git-doctor`, `balm-git-dev` and `balm-git-prod`
