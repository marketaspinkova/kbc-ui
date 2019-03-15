import React from 'react';

import createReactClass from 'create-react-class';

/**
 * Creates components with set of props
 * @param {Object} props Properties
 * @returns {Function} React Component
 */
export default function(props) {
  return InnerComponent => createReactClass({
    render() {
      return (
        <InnerComponent {...props} />
      );
    }
  });
}