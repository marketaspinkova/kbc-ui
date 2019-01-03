import React, { PropTypes } from 'react';
import BackendVersionModal from './Modal';
import actionCreators from '../../../../ActionCreators';
import { getVersions } from './versions';

export default React.createClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  render() {
    return (
      <span>
        <span className="label label-default small" style={{cursor: 'pointer'}} onClick={this.showModal}>
          Backend Version: {this.props.transformation.has('imageTag') ? this.props.transformation.get('imageTag') : 'Latest'}
          {' '}<i className="fa fa-pencil" />
        </span>
        <BackendVersionModal
          show={this.state.showModal}
          availableVersions={getVersions(this.props.transformation.get('type'))}
          onClose={this.hideModal}
          onSave={this.saveImageTag}
          imageTag={this.props.transformation.has('imageTag') ? this.props.transformation.get('imageTag') : ''}
        />
      </span>
    );
  },

  saveImageTag(imageTag) {
    if (!imageTag) {
      return actionCreators.deleteTransformationProperty(
        this.props.bucketId,
        this.props.transformation.get('id'),
        'imageTag',
        `Deleted imageTag in ${this.props.transformation.get('name')}`
      );
    }
    return actionCreators.changeTransformationProperty(
      this.props.bucketId,
      this.props.transformation.get('id'),
      'imageTag',
      imageTag,
      `Set imageTag to ${imageTag} in ${this.props.transformation.get('name')}`
    );
  },

  showModal() {
    this.setState({
      showModal: true
    });
  },

  hideModal() {
    this.setState({
      showModal: false
    });
  }
});
