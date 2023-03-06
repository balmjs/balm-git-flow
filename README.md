# Balm Git Flow

> The best practices for front-end git flow

## Workflow

1. main(source code) -> dev(feat, fix...) -> prod(test, pre-production...)
2. main(source code) -> prod(production)

## Requirements

1. [Node.js](https://nodejs.org/) ^14.18.0 || ^16.0.0
2. [Git](https://git-scm.com/) 2.6.0+

## Installation

```sh
npm install -g balm-git-flow
```

## Configuration

⚠️ First, create a **`balm.env.js`** file in your project root directory

| Variable Name           | Type     | Description                                             |
| ----------------------- | -------- | ------------------------------------------------------- |
| BALM_GIT_FLOW_NAME      | `string` | project name                                            |
| BALM_GIT_FLOW_MAIN      | `string` | main branch                                             |
| BALM_GIT_FLOW_RELEASE   | `string` | production release branch                               |
| BALM_GIT_FLOW_RELEASES  | `array`  | all release branches                                    |
| BALM_GIT_FLOW_SCRIPTS   | `array`  | all build scripts corresponding to the release branches |
| BALM_GIT_FLOW_BUILD_DIR | `string` | build out dir                                           |

## Usage

- `balm-git doctor`: check the project environment
- `balm-git dev <new-branch> [<start-point>]`: create new branch for development from origin main branch
- `balm-git prod`: release process
