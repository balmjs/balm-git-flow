# Balm Git Flow

> The best practices for front-end git flow

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

| Variable Name              | Type     | Description                                                                                        |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| BALM_GIT_FLOW_MAIN         | `string` | main branch (source code)                                                                          |
| BALM_GIT_FLOW_RELEASE      | `string` | production release branch                                                                          |
| BALM_GIT_FLOW_RELEASES     | `array`  | all release branches                                                                               |
| BALM_GIT_FLOW_SCRIPTS      | `array`  | all build scripts corresponding to the release branches ( the keys of `scripts` in `package.json`) |
| BALM_GIT_FLOW_BUILD_DIR    | `string` | build out dir (by `npm-run-script`)                                                                |
| BALM_GIT_FLOW_REPOSITORIES | `array`  | remote repositories                                                                                |
| BALM_GIT_FLOW_SITE         | `string` | production release branch (remote) for project site                                                |

## Usage

- `balm-git doctor`: check the project environment
- `balm-git dev <new-branch> [<start-point>]`: create new branch for development from origin main branch
- `balm-git prod`: release process

> ⚠️ NOTE: For Windows users, use `balm-git-doctor`, `balm-git-dev` and `balm-git-prod`
