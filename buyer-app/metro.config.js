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
    ],
  },
  watchFolders: [path.resolve(__dirname, 'src')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
