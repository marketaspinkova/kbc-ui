import React from 'react';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    isTruncated: React.PropTypes.bool
  },

  render() {
    return (
      <span>
        {this.props.isTruncated && <strong>[Truncated] </strong>} {this.props.value}
      </span>
    );
  }
});