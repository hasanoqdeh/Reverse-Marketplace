const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    blockList: [
      // Exclude Android CMake build output (major source of watcher exhaustion)
      /node_modules\/.*\/android\/.cxx\/.*/,
      /node_modules\/.*\/android\/build\/.*/,
      /node_modules\/.*\/ios\/build\/.*/,
      /android\/build\/.*/,
      /android\/.cxx\/.*/,
      /ios\/build\/.*/,
      // Exclude gradle-plugin Kotlin/Java build output (directory may not exist yet)
      /node_modules\/@react-native\/gradle-plugin\/build\/.*/,
    ],
  },
  watchFolders: [path.resolve(__dirname, 'src')],
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'mp3', 'mp4', 'wav'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
