<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/new_ui/resources/icons/png/128x128.png?raw=true")
</p>

## Ganache

Ganache is your personal blockchain for Ethereum development. 

<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/new_ui/.github/images/ganache_screenshot.jpg?raw=true"/>
</p>

### Contributing

Please open issues and pull requests for new features, questions, and bug fixes.

Requirements:

- `npm v5.3.0`
- `node v8.3.0`

To get started:

0. Clone this repo
0. Run `npm install`
0. Run `npm start`

If using Windows, you may need [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) installed first.

### Building

For all platforms, you can build versions for all platforms by running `npm run make`. Each platform and make target may require special configuration. Note that Windows and Mac require certificates; for security reasons these certs aren't uploaded to github. Before building, create the `./certs` directory with the following files:

* `./certs/cert.pfx` - for Windows builds. Note a `.pfx` file is identical to a `.p12`. (Just change the extension.)

On Windows: 

* To build the `appx` make target, ensure you have the [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk) installed. If you have errors during make, ensure the package.json file's `windowsStoreConfig.windowsKit` points to your Windows 10 SDK directory.

### License

See LICENSE file

### By Truffle

Ganache is part of the Truffle suite of tools. [Find out more!](http://truffleframework.com)
