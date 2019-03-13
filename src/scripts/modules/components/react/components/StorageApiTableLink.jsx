import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { parse as parseTable } from '../../../../utils/tableIdParser';

export default React.createClass({
  propTypes: {
    tableId: PropTypes.string.isRequired,
    children: PropTypes.any
  },

  render() {
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
});
