import PropTypes from 'prop-types';
import React from 'react';
import NewTransformation from '../modals/NewTransformation';
import TransformationBucketEmptyImage from '../../../../../images/transformation-bucket-empty.png';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired
  },

  imageUrl(image) {
    return ApplicationStore.getScriptsBasePath() + image;
  },

  render() {
    return (
      <div className="row transformation-bucket-empty-state">
        <span className="col-md-4 text-center"><img src={this.imageUrl(TransformationBucketEmptyImage)} /></span>
        <span className="col-md-8">
          <h2>This transformation bucket is empty.</h2>
          <p className="add-button"><NewTransformation type="button" label="New Transformation" bucket={this.props.bucket}/></p>
          <p className="help"><small><strong>What is a transformation?</strong><br />Transformations pick data from Storage, manipulate it and then store it back. They can be written in SQL (Snowflake), Python, R or OpenRefine.</small></p>
        </span>
      </div>
    );
  }
});
