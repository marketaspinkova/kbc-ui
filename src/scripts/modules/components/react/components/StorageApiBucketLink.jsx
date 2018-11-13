import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any.isRequired
  },

  bucketUrl() {
    return ApplicationStore.getSapiBucketUrl(this.props.bucketId);
  },

  render() {
    return (
      <ExternalLink
        href={this.bucketUrl()}
      >{this.props.children}</ExternalLink>
    );
  }
});
