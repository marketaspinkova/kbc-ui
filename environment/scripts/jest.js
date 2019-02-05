process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

const jest = require('jest-cli/build/cli');
const argv = process.argv.slice(2);

if (process.env.DEV_CACHE !== 'true') {
  argv.push('--no-cache');
}

jest.run(argv);
