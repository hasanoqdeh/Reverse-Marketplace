/* Jest setup: mock native modules that have no implementation under Node. */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));
