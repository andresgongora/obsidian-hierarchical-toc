module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    moduleFileExtensions: ['js', 'ts'],
    moduleDirectories: ['node_modules', 'src'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{js,ts}',
      '!src/**/*.d.ts'
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],

    setupFiles: ['./tests/setup.ts'],
    globalSetup: './tests/global-setup.cjs',
};
