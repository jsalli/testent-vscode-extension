# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Fixed crash when creating an unit test for function with no input arguments

## [0.2.2] - 2022-12-07

### Changes

- Changes coloring of Output channel for code running feature
- Changes debugging experience so that VSCode is `suppressSaveBeforeStart:true` flag so that in newer VSCode versions user is not asked to save the Untitled input view which was used to start the debugging session

### Fixed

- Fixes bug in which debugging crashed with `CustomError: Cannot find module` if there were imports in user's code

## [0.2.1] - 2022-12-02

### Added

- Adds Mac OS X / macOS support
- Adds telemetrics with @vscode/extension-telemetry library to understand usage. No sensitive data is sent to the Azure Application insights.

### Changes

- Add available settings to README.md
- Add info about telemetrics to README.md

### Fixed

- Debugging crashes if source file inside a subfolder in src-folder.

## [0.2.00] - 2022-11-08

### Added

- Adds ability to debug Javascript and Typescript functions with the user given inputs

### Changes

- Changes the order and name of codelenses in some cases
- Changes the Testent logo to a new one
- Changes the running of a function from the integrated terminal to a background terminal. The output is printed to a VSCode Output Channel

## [0.1.12] - 2022-10-12

### Added

- Adds support for CommonJS projects
- Adds support for monorepo projects

## [0.1.11] - 2022-09-26

### Changes

- Changes the gif-video showing automated unit test writing to a new one with text annotation.

### Added

- Adds information about the NodeJS project module type limitations to Readme.md.

## [0.1.10] - 2022-09-05

### Fixed

- Fixes Error with message "Cannot read properties of undefined (reading 'emitNode')" when setting option `const createInternalFunctionExpects__1: boolean = true;` to true in the input giving view.
- Fixes Failing Jest tests in which the mock had not been reseted correctly. For example created test code for `axios.get` was `mockedAxios.resetMock()`. Should have been `mockedAxios.get.resetMock()`. See the Changed section.

### Changed

- Changes the jest command used to reset mocks. Previously each created mock was reseted separately. Because there is no other option at the moment than reseting all mock between tests the extension now uses `jest.resetAllMocks()` in `beforeEach` to reset all mocks.

### Added

- Adds a "Open file"-button to the dialog showing a new test has been generated.

## [0.1.9] - 2022-08-26

### Changed

- Change CodeLens names for CodeLenses running and creating a single test case. "Run" -> "Run this". "Create" -> "Create this".
- Change CodeLens name for CodeLens running all test cases. "Run" -> "Run all".

### Fixed

- Fixes "Recording has a MissingOutput recording" issues when generating an unit test for function which calls a function which throws.

## [0.1.8] - 2022-08-24

### Changed

- Change the extension to use a bundled-in version of ts-node (version 10.9.1) to work more stable.

## [0.1.7] - 2022-08-22

### Changed

- Change default values for function input variables now depend on the type of the variable. Not any more a string "FILL THIS" for all input types.

### Fixed

- Fixes crashing "function-run-without-test-generation" on Windows platform.

## [0.1.6] - 2022-07-07

### Changed

- Improve documentation
- Change supported VSCode version from `^1.37.1` to `^1.58.1`

### Fixed

- Fixes test generation for functions returning an array.
- Fixes test generation for async function's which throw an exception. Expect-function's callback is now async function

## [0.1.5] - 2022-06-29

### Added

- Adds better error handling informing of known issues and giving link to the open Github issue
- Adds README documentation of the basic plugin usage

### Fixed

- Fixes test running-without-recording on Windows environment to use shell defined by `testent.runOptions.windowsTerminalExecutablePath`-setting
