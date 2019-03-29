import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { trim, rtrim } from 'underscore.string';
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
    const projectUrlTemplate = ApplicationStore.getProjectUrlTemplate();
    const projectPath = _.template(projectUrlTemplate)({ projectId: this.props.projectId });

    return `${rtrim(this.props.stackUrl, '/')}/${trim(projectPath, '/')}/storage-explorer/${this.props.bucketId}`;
  },

  render() {
    if (this.props.stackUrl && this.props.projectId && this.props.bucketId) {
      return (
        <ExternalLink href={this.getBucketUrl()}>
          {this.props.children}
        </ExternalLink>
      );
    }

    return this.props.children;
  }

});
