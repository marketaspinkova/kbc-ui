import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

export default (bucket, restoreTransformationBucketFn) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },
    revertConfigRemove: function() {
      restoreTransformationBucketFn(bucket);
      return this.props.onClick();
    },
    render: function() {
      return (
        <span>
          {'Bucket ' + (bucket.get('name')) + ' was moved to '}
          <Link to="settings-trash" onClick={this.props.onClick}>Trash</Link>
          {'. '}
          <a onClick={this.revertConfigRemove}>Restore</a>
        </span>
      );
    }
  });
};
