// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const sharedPath = path.resolve(__dirname, '../shared');
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('cjs');

defaultConfig.resolver.extraNodeModules = {
  '@shared': sharedPath
}


module.exports = {
  ...defaultConfig,

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [
    sharedPath,
    path.resolve('.')
  ]
}


// https://github.com/facebook/metro/issues/7