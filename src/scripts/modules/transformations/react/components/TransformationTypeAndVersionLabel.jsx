import React, { PropTypes } from 'react';
import moment from 'moment';

import ApplicationStore from '../../../../stores/ApplicationStore';
import { Image, Label } from 'react-bootstrap';

import backendLogoR from '../../../../../images/backend-logo-r.svg';
import backendLogoMySql from '../../../../../images/backend-logo-mysql.svg';
import backendLogoPython from '../../../../../images/backend-logo-python.svg';
import backendLogoOpenRefine from '../../../../../images/backend-logo-openrefine.svg';
import backendLogoSnowflake from '../../../../../images/backend-logo-snowflake.svg';
import backendLogoRedshift from '../../../../../images/backend-logo-redshift.svg';

import actionCreators from '../../ActionCreators';
import { transformationBackend, transformationType, transformationLabels } from '../../Constants';
import {getVersions, hasVersions} from './backend-version/versions';
import BackendVersionModal from './backend-version/Modal';

const paths = {
  r: backendLogoR,
  mysql: backendLogoMySql,
  python: backendLogoPython,
  openrefine: backendLogoOpenRefine,
  snowflake: backendLogoSnowflake,
  redshift: backendLogoRedshift
};

export default React.createClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired,
    showVersion: PropTypes.bool,
    showVersionEditButton: PropTypes.bool
  },

  getDefaultProps() {
    return {
      showVersion: false,
      showVersionEditBtn: false
    };
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  render() {
    const backendName = this.resolveBackendName();
    if (!backendName) {
      return null;
    }
    return (
      <span className="label-backend-wrap">
        <Image
          src={ApplicationStore.getScriptsBasePath() + paths[backendName]}
          width="19px"
          height="19px"
          className="label-backend-image"
        />
        {this.canSetBackendVersion()
          ? this.renderBackendLabelAndVersion(backendName)
          : this.renderBackendLabel(backendName)
        }
      </span>
    );
  },

  canSetBackendVersion() {
    return this.props.showVersion
      && this.props.transformation.get('backend') === transformationBackend.DOCKER
      && [transformationType.PYTHON, transformationType.R].includes(this.props.transformation.get('type'))
      && (
        this.props.transformation.has('imageTag')
        || hasVersions(this.props.transformation.get('type'), moment().unix())
      );
  },

  renderBackendLabelAndVersion(backendName) {
    if (this.props.showVersionEditButton) {
      return (
        <span>
          <Label className="label-backend" style={{cursor: 'pointer'}} onClick={this.showModal}>
            {transformationLabels[backendName]}
            {this.props.transformation.has('imageTag') && (
              <span>: {this.props.transformation.get('imageTag')}</span>
            )}
            {' '}<i className="fa fa-pencil" />
          </Label>
          <BackendVersionModal
            show={this.state.showModal}
            availableVersions={getVersions(this.props.transformation.get('type'), moment().unix())}
            onClose={this.hideModal}
            onSave={this.saveImageTag}
            imageTag={this.props.transformation.has('imageTag') ? this.props.transformation.get('imageTag') : ''}
          />
        </span>

      );
    }
    return (
      <Label className="label-backend">
        {transformationLabels[backendName]}
        {this.props.transformation.has('imageTag') && (
          <span>: {this.props.transformation.get('imageTag')}</span>
        )}
      </Label>
    );
  },

  renderBackendLabel(backendName) {
    return (
      <Label className="label-backend">
        {transformationLabels[backendName]}
      </Label>
    );
  },

  resolveBackendName() {
    if (this.props.transformation.get('backend') === transformationBackend.DOCKER) {
      return this.props.transformation.get('type');
    } else {
      return this.props.transformation.get('backend');
    }
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
  }
});
