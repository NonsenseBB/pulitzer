module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: [],
  coverageReporters: ['cobertura', 'lcov', 'text-summary']
}
