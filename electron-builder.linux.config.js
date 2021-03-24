const config = {
  linux: {
    target: [
      {
        target: "AppImage",
        arch: [
          "x64"
        ]
      }
    ],
    icon: "icons/png/",
    category: "Development",
    executableName: "Ganache",
    artifactName: "ganache-${version}-${os}-${arch}.${ext}"
  }
};

module.exports = config;
