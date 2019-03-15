import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  propTypes: {
    children: PropTypes.node
  },
  render() {
    return (
      <div className="row component-empty-state text-center">
        {this.props.children}
      </div>
    );
  }
});