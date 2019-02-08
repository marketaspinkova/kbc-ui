import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { FEATURE_UI_DEVEL_PREVIEW } from '../../../../constants/KbcConstants';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any.isRequired
  },

  bucketUrl() {
    return ApplicationStore.getSapiBucketUrl(this.props.bucketId);
  },

  render() {
    if (ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW)) {
      return (
        <Link
          to="storage-explorer-bucket"
          params={{
            bucketId: this.props.bucketId
          }}
        >
          {this.props.children}
        </Link>
      );
    }
    return (
      <ExternalLink
        href={this.bucketUrl()}
      >{this.props.children}</ExternalLink>
    );
  }
});
