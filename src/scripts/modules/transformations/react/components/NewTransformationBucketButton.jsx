import PropTypes from 'prop-types';
import React from 'react';
import NewTransformationBucketModal from '../modals/NewTransformationBucket';

export default React.createClass({
  propTypes: {
    label: PropTypes.string
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
