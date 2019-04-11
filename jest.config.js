module.exports = {
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  roots: ['<rootDir>/src/scripts'],
  moduleFileExtensions: ['jsx', 'js', 'json'],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/environment/jest/FileStub.js',
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/environment/jest/CSSStub.js'
  },
  setupFiles: ['<rootDir>/environment/tests/_setup'],
  snapshotSerializers: ['<rootDir>/node_modules/enzyme-to-json/serializer'],
  testPathIgnorePatterns: [],
  testRegex: '\\.(test|spec)\\.(js|jsx)$',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname']
};
