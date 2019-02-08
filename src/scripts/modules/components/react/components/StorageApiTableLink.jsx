import React from 'react';
import { Link } from 'react-router';
import { ExternalLink } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { parse as parseTable } from '../../../../utils/tableIdParser';

const UI_DEVEL_PREVIEW_FEATURE = 'ui-devel-preview';

export default React.createClass({
  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    children: React.PropTypes.any
  },

  tableUrl() {
    return ApplicationStore.getSapiTableUrl(this.props.tableId);
  },

  render() {
    if (ApplicationStore.hasCurrentAdminFeature(UI_DEVEL_PREVIEW_FEATURE)) {
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
