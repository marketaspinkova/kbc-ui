import React, {PropTypes} from 'react';
import _ from 'underscore';

import EmptyState from '../../../components/react/components/ComponentEmptyState';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import StorageTableDataPreviewItem from '../../../../react/common/StorageTableDataPreviewItem';
import {Table} from 'react-bootstrap';


export default React.createClass({
  propTypes: {
    tableExists: PropTypes.bool.isRequired,
    table: PropTypes.object,
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string
  },

  mixins: [PureRenderMixin],

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

    const columns = this.props.dataPreview.columns;
    const headerRow = this.renderHeaderRow();

    const columnsRows = columns.map((c, idx) => {
      const values = this.getColumnValues(c);
      let result = values.filter((item) => item.value !== '');
      return this.renderBodyRow(this.renderNameColumnCell(c), result, idx);
    });

    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
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

  renderBodyRow(columnNameCell, values, idx) {
    return (
      <tr key={idx}>
        <td>
          {columnNameCell}
        </td>
        <td>
          {values.map((item, key) => {
            return (
              <span key={key}>
                {key !== 0 && ', '}<StorageTableDataPreviewItem item={item}/>
              </span>
            );
          })}
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
