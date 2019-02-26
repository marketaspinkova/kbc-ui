import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any.isRequired
  },

  render() {
    return (
      <Link
        to="storage-explorer-bucket"
        params={{
          bucketId: this.props.bucketId
        }}
      >
        {this.props.children}
      </Link>
    );
  }
});
