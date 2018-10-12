import React from 'react';
import NewTransformationBucketModal from '../modals/NewTransformationBucket';

export default React.createClass({
  propTypes: {
    label: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      label: 'New Bucket'
    };
  },

  render() {
    return <NewTransformationBucketModal label={this.props.label} />;
  }
});
