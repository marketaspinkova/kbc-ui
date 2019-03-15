import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
  propTypes: {
    item: PropTypes.object
  },

  render() {
    return (
      <span>
        {this.props.item.isTruncated && <strong>[Truncated] </strong>} {this.props.item.value}
      </span>
    );
  }
});