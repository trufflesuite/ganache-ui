![](https://github.com/trufflesuite/ganache/blob/new_ui/.github/images/ganache_banner.jpg?raw=true)

## Ganache

Ganache is an Ethereum blockchain on your desktop. It's the best way to get an Ethereum test chain up and running on your own machine in minutes.

This is what it looks like:

![Ganache](https://github.com/trufflesuite/ganache/blob/new_ui/.github/images/ganache_screenshot.jpg?raw=true)

The goals of the project are:

- Provide an easier path to getting started with Ethereum Blockchain.
- Provide a robust cross-platform Desktop Application that bypasses all of the current cross-platform installation issues some people experience with `ethereum-testrpc`.
- Allows for more complex use cases for `ethereum-testrpc` in a more convenient environment.
- Provide a mechanism for more ambitious use cases

## Features

- Convenient Account status display
- A web3 enabled console
- Built in block and transaction explorers
- Block and transaction search
- Snapshotting: take snapshots of the entire blockchain state and revert back to them later

### Console Features

The console is a full Javascript console with some pre-built helpers.

Brief command list:

- `help()` - displays the console help text
- `etherBalance(<address>)` - Get the balance of the given address
- `account<n>` - shortcut to the account at the given index n address
- `accounts` - an array of all available account addresses
- `totalAccounts` - the total number of available accounts
- `web3` - a full web3 object pre-setup to connect to the ganache core instance

### Development

If you wish to submit a PR, please open an issue first to discuss its suitability. When opening issues and PRs, please read the template text carefully and follow the instructions.

Requirements for development:

- `npm v5.3.0`
- `node v8.3.0`
- Your environment & platform must be setup to be able to build native modules as necessary.

To get started:

0. Clone this repo
0. Run `npm install`
0. Run `npm start`

(You can try Yarn if you want, but sometimes it seems not to trigger the necessary rebuilds for electron)

### Windows Developers

Make sure you have Node setup correctly, with all of the VS2015 packages etc required for development.

### Linux Developers

First of all, make sure your Node installation is the official Node release for your platform as documented [here](https://nodejs.org/en/download/package-manager/). Some of the dependencies that Ganache uses are a bit tricky to get building locally. You might have to run `npm install --build-from-source`.

## Publishing Release to Github

A GitHub personal access token is required. You can generate by going to https://github.com/settings/tokens/new. The access token should have the repo scope/permission. Define GH_TOKEN environment variable.

### License

GPL - See LICENSE file

### Authors & Contributors

- John McDowall (@johnmcdowall) - Main author & designer

### A ConsenSys Formation

The development of this project has been funded by ConsenSys LLC
