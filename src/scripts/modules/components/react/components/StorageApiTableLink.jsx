import React from 'react';
import { Link } from 'react-router';
import { ExternalLink } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { parse as parseTable } from '../../../../utils/tableIdParser';
import { FEATURE_UI_DEVEL_PREVIEW } from '../../../../constants/KbcConstants';

export default React.createClass({
  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any
  },

  tableUrl() {
    return ApplicationStore.getSapiTableUrl(this.props.tableId);
  },

  render() {
    if (ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW)) {
      const parsedTable = parseTable(this.props.tableId);
      return (
        <Link
          to="storage-explorer-table"
          params={{
            bucketId: `${parsedTable.parts.stage}.${parsedTable.parts.bucket}`,
            tableName: parsedTable.parts.table
          }}
        >
          {this.props.children}
        </Link>
      );
    }
    return (
      <ExternalLink href={this.tableUrl()}>{this.props.children}</ExternalLink>
    );
  }

});
