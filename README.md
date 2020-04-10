<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/develop/static/icons/png/128x128.png?raw=true")
</p>

## Ganache

Ganache is your personal blockchain for Ethereum development. 

<p align="center">
  <img src="https://github.com/trufflesuite/ganache/blob/develop/.github/images/ganache_screenshot.jpg?raw=true"/>
</p>

### Getting started

You can download a self-contained prebuilt Ganache binary for your platform of choice using the "Download" button on the [Ganache](https://trufflesuite.com/ganache/) website, or from this repository's [releases](https://github.com/trufflesuite/ganache/releases) page.

### Contributing

Please open issues and pull requests for new features, questions, and bug fixes.

Requirements:

- `node v12.13.1`

To get started:

0. Clone this repo
0. Run `npm install`
0. Run `npm run dev`

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

`electron-icon-maker` generates assets for all platforms when using Electron's `squirrel` package, and these assets live in `./static/icons`. `svg2uwptiles` generates all assets needed for the Windows appx build, and those assets live in `./build/appx`. These locations *can* be changed in the future, but make sure to change the associated configuration pointing to these assets.

Note from the author: I found managing these assets manually -- especially the appx assets -- was a pain. If possible, try not to edit the assets themselves and use one of the generators above.

### Flavored Development

"Extras" aren't stored here in this repository fordue to file size issues, licensing issues, or both.

Non-ethereum "flavored" Ganache extras are uploaded to releases here: https://github.com/trufflesuite/ganache-flavors/releases

When "extras" change they should be uploaded to a new release, and a corresonding Ganache release that targets the new ganache-flavors release (see `common/extras/index.js` for what you'dd need to update)

#### Corda

Corda requires 4 "extras" that get downloaded at runtime.

`braid-server.jar` is used to communicate to corda nodes via JSON RPC over HTTP. This file is built from https://gitlab.com/bluebank/braid/tree/master/braid-server. To build: run `mvn clean install` in the root of the project.

`corda-tools-network-bootstrapper-4.3.jar` is used to create corda networks from configuration (`_node.conf`) files. It contains an embedded `corda.jar` and the logic required to create a network. To update or download the latest corda-tools-network-bootstrapper go to https://software.r3.com/artifactory/corda-releases/net/corda/ and download the version you want. You'll need to update the file name in `src/common/extras/index.js` if the version changes.

Corda and braid require Java's *JRE* `1.8`, aka `8`. We "release" 4 versions of JRE 1.8: Linux x64, Mac x64, Windows x32, and Windows x64. The Java releases are downloaded from https://adoptopenjdk.net/archive.html -- we use "OpenJDK 8 (LTS)" with "HotSpot". To redistribute these files you will need to unpack/unzip them, then zip them up again (make sure you are on Linux for the Linux release, as it needs its file permissions properly embedded within the zip). It is very important that you **ensure that all files are stored at the root of the zip**. You'll also want to rename the zip files in the following format: `OpenJDK8U-jre_{arch}_{os-name}_hotspot_{version}.zip`. You'll need to update the `version` in `src/common/extras/index.js` if it changes.

Corda requires PostgreSQL 9.6. We "release" 4 versions of PostgreSQL 9.6: Linux x64, Mac x64, Windows x32, and Windows x64. These are downloaded from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads.To redistribute these files you will need to unpack/unzip them, then zip them up again (make sure you are on Linux for the Linux release, as it needs its file permissions properly embedded within the zip). It is very important that you **ensure that all files are stored at the root of the zip**. You'll also want to rename the zip files in the following format: `postgresql-{version}-2-{os-name}-{arch}-binaries.zip`. You'll need to update the `version` in `src/common/extras/index.js` if it changes.


### By Truffle

Ganache is part of the Truffle suite of tools. [Find out more!](https://trufflesuite.com)
