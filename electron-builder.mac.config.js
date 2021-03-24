const config = {
  mac: {
    icon: "icons/mac/icon.icns",
    hardenedRuntime: true,
    entitlements: "./build/dmg/entitlements.mac.inherit.plist",
    category: "public.app-category.developer-tools"
  },
  dmg: {
    background: "build/dmg/background.tiff",
    contents: [
      {
        x: 219,
        y: 358,
        type: "dir",
        name: "Ganache.app"
      },
      {
        x: 439,
        y: 358,
        type: "link",
        name: "Applications",
        path: "/Applications"
      }
    ],
    format: "ULFO",
    sign: true,
    artifactName: "Ganache-${version}-${os}.${ext}"
  }
};

module.exports = config;
