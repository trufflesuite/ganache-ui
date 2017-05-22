## Ganache

Ganache is an Electron based UI for TestRPC.

This is what it looks like:

![Ganache](https://github.com/trufflesuite/ganache/blob/master/.github/images/ganache_screenshot.jpg)

It is currently in active development towards a Beta release.

It is not ready for production (but you can play with it now if you want).

The goals of the project are:

- Provide an easier path to getting started with Ethereum Blockchain.
- Provide a robust cross-platform Desktop Application that bypasses all of the current cross-platform installation issues some people experience with `ethereum-testrpc`.
- Allows for more complex use cases for `ethereum-testrpc` in a more convienient environment.

### Development

0. Clone this repo
0. Run `yarn install`
0. Run `./node_modules/.bin/electron-rebuild`
0. Run `npm run dev`

## Publishing Release to github

A GitHub personal access token is required. You can generate by going to https://github.com/settings/tokens/new. The access token should have the repo scope/permission. Define GH_TOKEN environment variable.



### License

GPL - See LICENSE file

### Authors & Contributors

- John McDowall (@johnmcdowall) - Main author

### A ConsenSys Formation

The development of this project has been funded by ConsenSys LLC
