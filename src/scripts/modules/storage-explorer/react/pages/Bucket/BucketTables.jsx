import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { Table } from 'react-bootstrap';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import FileSize from '../../../../../react/common/FileSize';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired
  },

  render() {
    return (
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rows count</th>
            <th>Data size</th>
            <th>Created</th>
            <th>Last change</th>
          </tr>
        </thead>
        <tbody>{this.props.tables.map(this.renderTableRow).toArray()}</tbody>
      </Table>
    );
  },

  renderTableRow(table) {
    return (
      <tr key={table.get('id')}>
        <td>
          <Link
            to="storage-explorer-table"
            params={{ bucketId: this.props.bucket.get('id'), tableName: table.get('name') }}
            className={classnames({ alias: table.get('isAlias', false) })}
          >
            {table.get('name')} {table.get('isAlias', false) && ' (Alias)'}
          </Link>
        </td>
        <td>{table.get('rowsCount') || 'N/A'}</td>
        <td>
          <FileSize size={table.get('dataSizeBytes')} />
        </td>
        <td>
          <CreatedWithIcon createdTime={table.get('created')} />
        </td>
        <td>
          <CreatedWithIcon createdTime={table.get('lastChangeDate')} />
        </td>
      </tr>
    );
  }
});
