In order to succcessfully sign the appx bundle on Windows 10, an alternative `signtool.exe` to the binary bundled with electron-builder may need to be used. See https://github.com/electron-userland/electron-builder/pull/6817. 

Install Windows SDK 18362 from https://developer.microsoft.com/en-us/windows/downloads/sdk-archive, and set the signtool path for electron-builder as follows:

```
$env:SIGNTOOL_PATH='C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x64\signtool.exe'
```

note: Newer versions of the SDK may not work, as the default value for the `/fd` (file digest) argument was no longer supported (electron will exclude the argument if digest is `SHA1` [the default] when spawning `signtool.exe`, see https://github.com/electron-userland/electron-builder/blob/aeffe080e07f11057134947e09021cd9d6712935/packages/app-builder-lib/src/codeSign/windowsCodeSign.ts#L232). While older versions do not support the `SIGNTOOL_PATH` environment variable.