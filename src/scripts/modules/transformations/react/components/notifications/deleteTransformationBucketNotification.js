import React from 'react';
import { Link } from 'react-router';

export default (bucket, restoreTransformationBucketFn) => {
  return React.createClass({
    propTypes: {
      onClick: React.PropTypes.func.isRequired
    },
    revertConfigRemove: function() {
      restoreTransformationBucketFn(bucket);
      return this.props.onClick();
    },
    render: function() {
      return React.createElement(
        'span',
        null,
        'Bucket ' + (bucket.get('name')) + ' was moved to ',
        React.createElement(Link, {
          to: 'settings-trash',
          onClick: this.props.onClick
        }, 'Trash'),
        '. ',
        React.createElement('a', {
          onClick: this.revertConfigRemove
        }, 'Restore')
      );
    }
  });
};
