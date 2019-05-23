import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';

import Markdown from '../../../../../react/common/Markdown';
import {rowTypes} from '../../../DocumentationUtils';

export default createReactClass({

  propTypes: {
    documentationTree: PropTypes.object.isRequired,
    searchQuery: PropTypes.string,
    openedRows: PropTypes.object.isRequired,
    toggleDocumentationRow: PropTypes.func.isRequired
  },

  render() {
    return (
      <Table striped responsive>
       <tbody>{this.renderDocumentationTree()}</tbody>
      </Table>
    );
  },

  renderDocumentationTree() {
    return this.props.documentationTree.reduce((bucketsMemo, bucket) => {
      const bucketId = bucket.get('id');
      bucketsMemo.push(
        this.renderOneTableRow(bucketId, bucketId, bucket.get('bucketDescription'), rowTypes.BUCKET_ROW)
      );
      if (!this.props.openedRows.get(rowTypes.BUCKET_ROW + bucketId) && !this.props.searchQuery) {
        return bucketsMemo;
      }
      const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
        const tableId = table.get('id');
        tablesMemo.push(
          this.renderOneTableRow(tableId, table.get('name'), table.get('tableDescription'), rowTypes.TABLE_ROW)
        );
        if (!this.props.openedRows.get(rowTypes.TABLE_ROW + tableId) && !this.props.searchQuery) {
          return tablesMemo;
        }
        const columnsRows = table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
          // const description = table.getIn(['columnsDescriptions', column]);
          columnsMemo.push(this.renderOneTableRow(tableId + column, column, description, rowTypes.COLUMN_ROW));
          return columnsMemo;
        }, []);
        return tablesMemo.concat(columnsRows);
      }, []);
      return bucketsMemo.concat(bucketTablesRows);
    }, []);
  },

  renderOneTableRow(id, name, description, rowType) {
    const pointerClass = !this.props.searchQuery ? 'kbc-cursor-pointer ' : '';
    let divClassName = pointerClass + 'bucket-row';

    let rowTypeClassName = 'fa fa-folder';
    if (rowType === rowTypes.TABLE_ROW) {
      divClassName = pointerClass + 'table-row';
      rowTypeClassName = 'fa fa-table';
    }
    if (rowType === rowTypes.COLUMN_ROW) {
      divClassName = 'column-row';
      rowTypeClassName = 'fa fa-columns';
    }
    const isOpened = this.props.openedRows.get(rowType + id);
    const caretClass = isOpened ? 'fa fa-caret-down' : 'fa fa-caret-right';
    const caret = !this.props.searchQuery ? <i className={caretClass} /> : null;

    return (
      <tr key={id}>
        <td className="text-nowrap">
          <div className={divClassName} onClick={() => this.props.toggleDocumentationRow(rowType + id, !isOpened)}>
            {rowType !== rowTypes.COLUMN_ROW && caret}
            {' '}
            <i className={rowTypeClassName} />
            {' '}
            {name}
          </div>
        </td>
        <td className="kbc-break-all kbc-break-word">
          {description ? <Markdown source={description} collapsible={true} /> : 'N/A'}
        </td>
      </tr>
    );
  },
});