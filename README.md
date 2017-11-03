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

### Getting started

Requirements:

- `npm v5.3.0`
- `node v8.3.0`
- If using Windows, you may need [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) installed first.

Steps:

0. Clone this repo and cd into directory
0. Run `npm install`
0. Run `npm start`
0. Ganache application will open


### Building for All Platforms

You can build versions for all platforms by running `npm run make` (though this will only build the package for the make targets available to your OS). Each platform and make target may require special configuration. Note that Windows and Mac require certificates; for security reasons these certs aren't uploaded to github, nor are their passwords saved in source control. Before building, create the `./certs` directory with the following files:

* `./certs/cert.pfx` - for Windows builds. Note a `.pfx` file is identical to a `.p12`. (Just change the extension if you've been given a `.p12`.)

#### On Windows: 

To build the `appx` make target, first ensure you have the [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk) installed. If you have errors during make, ensure the package.json file's `windowsStoreConfig.windowsKit` points to your Windows 10 SDK directory. The one specified in the package.json file currently is what worked at the time this process was figured out; it may need to be updated periodically.

Because Windows requires a certificate to build the package -- and that certificate requires a password -- you'll need to run the following command instead of `npm run make`:

```
$ CERT_PASS="..." npm run make
```

Replace `...` in the command above with your certificat password.

### Generating Icon Assets

Asset generation generally only needs to happen once, or whenever the app's logo is updated. If you find you need to rebuild the assets, the following applications were used: 

Two tools were used:

* [electron-icon-maker](https://www.npmjs.com/package/electron-icon-maker)
* [svg2uwptiles](https://www.npmjs.com/package/svg2uwptiles)

`electron-icon-maker` generates assets for all platforms when using Electron's `squirrel` package, and these assets live in `./resources/icons`. `svg2uwptiles` generates all assets needed for the Windows appx build, and those assets live in `./resources/appx`. These locations *can* be changed in the future, but make sure to change the associated configuration pointing to these assets.

Note from the author: I found managing these assets manually -- especially the appx assets -- was a pain. If possible, try not to edit the assets themselves and use one of the generators above.

### License

See LICENSE file

### By Truffle

Ganache is part of the Truffle suite of tools. [Find out more!](http://truffleframework.com)
