const config = {
  win: {
    certificateSha1: "14E886EF4F6AA9CFC5752D8FA34FB142DA4DEF44",
    icon: "icons/win/icon.ico",
    verifyUpdateCodeSignature: false,
    target: [
      {
        target: "nsis",
        arch: [
          "x64"
        ]
      },
      {
        target: "appx",
        arch: [
          "x64"
        ]
      }
    ]
  },
  appx: {
    identityName: "GanacheUI",
    publisher: "CN=\"Truffle Blockchain Group, Inc\", O=\"Truffle Blockchain Group, Inc\", L=Yakima, S=Washington, C=US",
    publisherDisplayName: "Truffle",
    backgroundColor: "#34262A",
    artifactName: "Ganache-${version}-${os}-${arch}.${ext}"
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    artifactName: "Ganache-${version}-${os}-${arch}-setup.${ext}"
  },
};

module.exports = config;
