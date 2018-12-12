import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';

export default React.createClass({
  propTypes: {
    stackUrl: React.PropTypes.string,
    projectId: React.PropTypes.number,
    bucketId: React.PropTypes.string,
    children: React.PropTypes.any
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
