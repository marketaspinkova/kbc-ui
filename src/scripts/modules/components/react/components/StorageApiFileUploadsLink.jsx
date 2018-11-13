import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default React.createClass({
  propTypes: {
    children: React.PropTypes.any.isRequired
  },

  fileUploadsUrl() {
    return ApplicationStore.getSapiFileUploadsUrl();
  },

  render() {
    return (
      <a
        target="_blank"
        href={this.fileUploadsUrl()}
      >{this.props.children}</a>
    );
  }
});
