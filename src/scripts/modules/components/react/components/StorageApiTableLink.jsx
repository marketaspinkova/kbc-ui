import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any
  },

  tableUrl() {
    return ApplicationStore.getSapiTableUrl(this.props.tableId);
  },

  render() {
    return (
      <ExternalLink href={this.tableUrl()}>{this.props.children}</ExternalLink>
    );
  }

});
