import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    configurationId: React.PropTypes.string.isRequired
  },

  bucketId() {
    return 'in.c-keboola-ex-mongodb-' + this.props.configurationId;
  },

  bucketUrl() {
    return ApplicationStore.getSapiBucketUrl(this.bucketId());
  },

  render() {
    return (
      <ExternalLink href={this.bucketUrl()}>
        {this.bucketId()}
      </ExternalLink>
    );
  }

});
