/* eslint-disable no-console */
import './renderers';

console.error = (message) => {
  throw new Error(message);
};

console.warn = (message) => {
  // react-router is still using React.PropTypes and React.createClass
  if (
    message.includes('Accessing PropTypes via the main React package is deprecated') || 
    message.includes('Accessing createClass via the main React package is deprecated')  
  ) {
    return;
  }

  throw new Error(message);
};
