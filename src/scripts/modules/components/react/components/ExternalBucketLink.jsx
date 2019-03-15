import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';

export default createReactClass({
  propTypes: {
    stackUrl: PropTypes.string,
    projectId: PropTypes.number,
    bucketId: PropTypes.string,
    children: PropTypes.any
  },

  getBucketUrl() {
    const projectPath = _.template(ApplicationStore.getProjectUrlTemplate())({
      projectId: this.props.projectId
    });
    return this.props.stackUrl + projectPath.substring(1, projectPath.length - 1) + '/storage#/buckets/' + this.props.bucketId;
  },

  render() {
    if (this.props.stackUrl && this.props.projectId && this.props.bucketId) {
      return (
        <ExternalLink href={this.getBucketUrl()}>
          {this.props.children}
        </ExternalLink>
      );
    } else {
      return this.props.children;
    }
  }

});
