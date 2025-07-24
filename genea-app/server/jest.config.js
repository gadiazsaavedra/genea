module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./src/tests/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  verbose: true
};