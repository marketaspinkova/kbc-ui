import React, {PropTypes} from 'react';
import _ from 'underscore';

import EmptyState from '../../../../components/react/components/ComponentEmptyState';
import immutableMixin from 'react-immutable-render-mixin';

import {Table} from 'react-bootstrap';
import StorageTableDataPreviewItem from '../../../../../react/common/StorageTableDataPreviewItem';

export default React.createClass({
  propTypes: {
    tableExists: PropTypes.bool.isRequired,
    table: PropTypes.object,
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string
  },

  mixins: [immutableMixin],

  render() {
    if (this.props.dataPreviewError) {
      return (
        <EmptyState>
          {this.props.dataPreviewError}
        </EmptyState>
      );
    }

    if (!this.props.tableExists || !this.isDataPreview()) {
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }
    const {dataPreview} = this.props;
    const columns = dataPreview.columns;

    const headerRow = this.renderHeaderRow();

    const columnsRows = columns.map((c) => {
      const values = this.getColumnValues(c);
      let result = values.filter((item) => item.value !== '');
      return this.renderBodyRow(c, this.renderNameColumnCell(c), result);
    });

    return (
      <div>
        <Table responsive className="table table-striped">
          {headerRow}
          <tbody>
            {columnsRows}
          </tbody>
        </Table>
      </div>
    );
  },

  renderNameColumnCell(column) {
    const {table} = this.props,
      primary = table.get('primaryKey');
    return (
      <span>
        {column}
        <div>
          {primary.indexOf(column) > -1 ? ( <small><span className="label label-info">PK</span></small>) : '' }
        </div>
      </span>
    );
  },

  renderHeaderRow() {
    return (
      <thead>
        <tr>
          <th>
            Column
          </th>
          <th>
            Sample Values
          </th>
        </tr>
      </thead>
    );
  },

  renderBodyRow(columnName, columnNameCell, values) {
    return (
      <tr>
        <td>
          {columnNameCell}
        </td>
        <td>
          {values.map( (item, key) => <span>{key !== 0 && ', '}<StorageTableDataPreviewItem item={item} /></span>)}
        </td>
      </tr>
    );
  },

  getColumnValues(columnName) {
    const data = this.props.dataPreview;
    const columnIndex = data.columns.indexOf(columnName);
    return data.rows
      .map( (row) => {
        return row[columnIndex];
      });
  },

  isDataPreview() {
    return !_.isEmpty(this.props.dataPreview);
  }
});
