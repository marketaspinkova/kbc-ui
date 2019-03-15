import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

export default createReactClass({
  propTypes: {
    bucketId: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired
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
