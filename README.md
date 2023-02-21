<p align="center">
  <img src="https://github.com/trufflesuite/ganache-ui/blob/develop/static/icons/png/128x128.png?raw=true")
</p>

## Ganache

Ganache is your personal blockchain for Ethereum development.

<p align="center">
  <img src="https://github.com/trufflesuite/ganache-ui/blob/develop/.github/images/ganache_screenshot.jpg?raw=true"/>
</p>

### Getting started

You can download a self-contained prebuilt Ganache binary for your platform of choice using the "Download" button on the [Ganache](https://trufflesuite.com/ganache/) website, or from this repository's [releases](https://github.com/trufflesuite/ganache-ui/releases) page.

Ganache is also available as a command-line tool. If you prefer working on the command-line, check out the [ganache CLI](https://github.com/trufflesuite/ganache).

### Contributing

Please open issues and pull requests for new features, questions, and bug fixes.

Requirements:

- `node v14.21.1`

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

In order to successfully sign the appx bundle on Windows 10, an alternative `signtool.exe` to the binary bundled with electron-builder may need to be used. See https://github.com/electron-userland/electron-builder/pull/6817. 

Install Windows SDK 18362 from https://developer.microsoft.com/en-us/windows/downloads/sdk-archive, and set the signtool path for electron-builder as follows:

```
$env:SIGNTOOL_PATH='C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x64\signtool.exe'
```

note: Newer versions of the SDK may not work, as the default value for the `/fd` (file digest) argument was no longer supported (electron will exclude the argument if digest is `SHA1` [the default] when spawning `signtool.exe`, see https://github.com/electron-userland/electron-builder/blob/aeffe080e07f11057134947e09021cd9d6712935/packages/app-builder-lib/src/codeSign/windowsCodeSign.ts#L232). While older versions do not support the `SIGNTOOL_PATH` environment variable.

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

### VS Code Debugging

Below is a `.vscode/launch.json` configuration that will attach to both the **main** and **renderer** processes. You only need to run the **Launch Ganache UI** configuration; the renderer attach configuration will run automatically.

``` jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Renderer Process",
      "port": 9222,
      "request": "attach",
      "type": "pwa-chrome",
      "webRoot": "${workspaceFolder:ganache}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*"
      }
    },
    {
      "name": "Launch Ganache UI",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder:ganache}",
      "runtimeExecutable": "${workspaceFolder:ganache}/node_modules/.bin/electron-webpack",
      "args": ["dev"],
      "sourceMaps": true,
      "serverReadyAction": {
        "pattern": "Renderer debugger is listening on port ([0-9]+)",
        "action": "startDebugging",
        "name": "Attach to Renderer Process"
      }
    }
  ]
}
```


### By Truffle

Ganache is part of the Truffle suite of tools. [Find out more!](https://trufflesuite.com)
