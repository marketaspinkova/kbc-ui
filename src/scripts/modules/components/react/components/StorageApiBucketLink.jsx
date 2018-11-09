import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';

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
      <a
        target="_blank"
        href={this.bucketUrl()}
      >{this.props.children}</a>
    );
  }
});
