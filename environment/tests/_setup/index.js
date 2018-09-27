import './renderers';

/* eslint-disable no-console */

// Skip createElement warnings but fail tests on any other warnings and errors
console.error = message => {
  if (!/(React.createElement: type should not be null)/.test(message)) {
    throw new Error(message);
  }
};

console.warn = message => {
  throw new Error(message);
};
