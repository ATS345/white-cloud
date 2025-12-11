// Jest 配置文件
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|express|cors|helmet|sequelize|mysql2|redis|jsonwebtoken|bcrypt|joi|winston|dotenv|consul)/)',
  ],
  setupFiles: ['dotenv/config'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/controllers/**/*.js',
    '**/services/**/*.js',
    '**/models/**/*.js',
    '**/config/**/*.js',
    '**/middleware/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  verbose: true,
};
