import PropTypes from 'prop-types';
import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  render() {
    const { bucket, urlTemplates } = this.props;
    const bucketId = bucket.get('id');
    const projectId = bucket.getIn(['project', 'id']);
    const projectName = bucket.getIn(['project', 'name']);

    return (
      <span>
        <ExternalLink
          href={_.template(urlTemplates.get('project'))({ projectId })}
        >
          {projectName}
        </ExternalLink>
        {' / '}
        <ExternalLink
          href={`${_.template(urlTemplates.get('project'))({ projectId })}/storage-explorer/${bucketId}`}
        >
          {bucketId}
        </ExternalLink>
      </span>
    );
  }
});
