//jest.config.js
module.exports = {
  testTimeout: 20000,
  globalSetup: "./__tests__/setup/setup.js",
  globalTeardown: "./__tests__/setup/teardown.js",
  modulePathIgnorePatterns: ["./__tests__/setup/*", "./__tests__/performance/*"]
};