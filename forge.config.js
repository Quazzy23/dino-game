module.exports = {
  packagerConfig: {
    asar: false,
    icon: './images/icon.ico',
    ignore: [
      "^/\\.git$",
      "^/node_modules",
      "^/out"
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: require.resolve('@felixrieseberg/electron-forge-maker-nsis'),
      config: {
        oneClick: false,
        ui: {
          mui: true
        },
        perMachine: true,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        setupIcon: './images/icon.ico'
      }
    }
  ]
};