import React, { PropTypes } from 'react';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired
  },

  render() {
    const bucketId = this.props.bucket.get('bucketId');
    const projectId = this.props.bucket.getIn(['project', 'id']);
    const projectName = this.props.bucket.getIn(['project', 'name']);

    return (
      <span>
        <ExternalLink href={`/admin/projects/${projectId}`}>{projectName}</ExternalLink>
        {' / '}
        <ExternalLink href={`/admin/projects/${projectId}/storage#/buckets/${bucketId}`}>{bucketId}</ExternalLink>
      </span>
    );
  }
});
