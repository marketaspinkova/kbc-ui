import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
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