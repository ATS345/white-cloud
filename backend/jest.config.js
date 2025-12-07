export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['controllers/**/*.js', 'middleware/**/*.js', 'models/**/*.js', 'routes/**/*.js'],
  transform: {
    '^.+\.js$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }]
  },
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: ['/node_modules/']
}