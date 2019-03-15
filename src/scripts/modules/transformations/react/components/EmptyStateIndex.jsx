import React from 'react';
import createReactClass from 'create-react-class';
import NewTransformationBucketButton from './NewTransformationBucketButton';
import TransformationsEmptyImage from '../../../../../images/transformations-empty.png';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default createReactClass({
  imageUrl(image) {
    return ApplicationStore.getScriptsBasePath() + image;
  },

  render() {
    return (
      <div className="row transformation-index-empty-state">
        <span className="col-md-4 text-center"><img src={this.imageUrl(TransformationsEmptyImage)} /></span>
        <span className="col-md-8">
          <h2>Transformations allow you to modify your data.</h2>
          <p>Transformations pick data from Storage, manipulate it and then store it back. They can be written in SQL (Snowflake), R, Python or OpenRefine.</p>
          <p className="add-button"><NewTransformationBucketButton label="New Transformation Bucket"/></p>
          <p className="help"><small><strong>What is a transformation bucket?</strong><br />A transformation bucket is a container for related transformations. Once the bucket is created, you can start creating transformations inside it.</small></p>
        </span>
      </div>
    );
  }
});
