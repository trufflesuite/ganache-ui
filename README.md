<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/develop/resources/icons/png/128x128.png?raw=true")
</p>

## Ganache

Ganache is your personal blockchain for Ethereum development. 

<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/develop/.github/images/ganache_screenshot.jpg?raw=true"/>
</p>

### Getting started

You can download a self-contained prebuilt Ganache binary for your platform of choice using the "Download" button on the [Ganache](http://truffleframework.com/ganache/) website, or from this repository's [releases](https://github.com/trufflesuite/ganache/releases) page.

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

### Building for All Platforms

Each platform has an associated `npm run` configuration to help you build on each platform more easily. Because each platform has different (but similar) build processes, they require different configuration. Note that both Windows and Mac require certificates to sign the built packages; for security reasons these certs aren't uploaded to github, nor are their passwords saved in source control. 

#### On Windows:

Building on Windows will create a `.appx` file for use with the Windows Store.

Before building, create the `./certs` directory with the following files:

* `./certs/cert.pfx` - Note a `.pfx` file is identical to a `.p12`. (Just change the extension if you've been given a `.p12`.)

In order to build on Windows, you must first ensure you have the [Windows 10 SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk) installed. If you have errors during the build process, ensure the package.json file's `windowsStoreConfig.windowsKit` points to your Windows 10 SDK directory. The one specified in the package.json file currently is what worked at the time this process was figured out; it may need to be updated periodically.

Because Windows requires a certificate to build the package -- and that certificate requires a password -- you'll need to run the following command instead of `npm run make`:

```
$ CERT_PASS="..." npm run build-windows
```

Replace `...` in the command above with your certificate password.

This will create a `.appx` file in `./out/make`.

#### On Mac: 

Building on a Mac will create a standard Mac `.dmg` file.

Before building on a Mac, make sure you have Truffle's signing keys added to your keychain. Next, run the following command:

```
$ npm run build-mac
```

This will create a signed `.dmg` file in `./out/make`. 

#### On Linux: 

Bulding on Linux will create a `.AppImage` file, meant to run on many versions of Linux.

Linux requires no signing keys, so there's no set up. Simply run the following command:

```
$ npm run build-linux
```

This will create a `.AppImage` file in `./out/make`. 

### Generating Icon Assets

Asset generation generally only needs to happen once, or whenever the app's logo is updated. If you find you need to rebuild the assets, the following applications were used: 

Two tools were used:

* [electron-icon-maker](https://www.npmjs.com/package/electron-icon-maker)
* [svg2uwptiles](https://www.npmjs.com/package/svg2uwptiles)

`electron-icon-maker` generates assets for all platforms when using Electron's `squirrel` package, and these assets live in `./resources/icons`. `svg2uwptiles` generates all assets needed for the Windows appx build, and those assets live in `./resources/appx`. These locations *can* be changed in the future, but make sure to change the associated configuration pointing to these assets.

Note from the author: I found managing these assets manually -- especially the appx assets -- was a pain. If possible, try not to edit the assets themselves and use one of the generators above.

### By Truffle

Ganache is part of the Truffle suite of tools. [Find out more!](http://truffleframework.com)
