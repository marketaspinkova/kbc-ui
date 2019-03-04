/* eslint-disable no-console */
import './renderers';

// Skip createElement warnings but fail tests on any other warnings and errors
console.error = (message) => {
  if (message.includes('React.createElement: type should not be null')) {
    return;
  }

  throw new Error(message);
};

console.warn = (message) => {
  if (message.includes('is deprecated')) {
    return;
  }

  throw new Error(message);
};
