/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@eidosmedia/neon-frontoffice-ts-sdk$': '<rootDir>/src/neon-frontoffice-ts-sdk/src',
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
};