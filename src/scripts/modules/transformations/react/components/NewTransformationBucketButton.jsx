import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import NewTransformationBucketModal from '../modals/NewTransformationBucket';

export default createReactClass({
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
