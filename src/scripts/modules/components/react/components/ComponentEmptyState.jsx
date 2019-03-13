import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
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