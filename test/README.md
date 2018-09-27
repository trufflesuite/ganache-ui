# Contributing to Ganache UI Tests

Tests are to live in as many subdirectories as necessary for organizational purposes. Tests **are not** supposed to live in the root `/test` directory or the `/test/mocha` or `/test/spectron` (doesn't exist yet) directories.

## Executing Tests
You can execute tests by running `npm test`. This will `npm run test-mocha` ~~and `npm run test-spectron`~~ (not added yet).

## Mocha
For components that do not require Electron, it is recommended to write Mocha tests instead as they are lighter.

For a Mocha test to be executed by `npm test` or `npm run test-mocha`, it must be located in a subdirectory of `/test/mocha` matching the glob pattern `*.test.js`.

### Subtests
You may see files with the glob pattern `*.subtest.js`. These files are not named `*.test.js` for the purpose of organizing them in a single Mocha `describe()`. A main loader `*.test.js` file will require the `*.subtest.js` files for execution. See how [workspace tests implement this](mocha/workspaces/workspaces.test.js).

## Spectron
Currently, there are no Spectron tests, nor is there the framework necessary to execute Spectron tests. However, Spectron test support will be added eventually.