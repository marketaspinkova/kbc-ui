import PropTypes from 'prop-types';
import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    children: PropTypes.any.isRequired
  },

  fileUploadsUrl() {
    return ApplicationStore.getSapiFileUploadsUrl();
  },

  render() {
    return (
      <ExternalLink
        href={this.fileUploadsUrl()}
      >{this.props.children}</ExternalLink>
    );
  }
});
