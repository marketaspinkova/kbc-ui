import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

import Markdown from '../../../../../react/common/Markdown';
import { rowTypes, reduceDocumentationTree } from './DocumentationUtils';

export default createReactClass({
  propTypes: {
    documentationTree: PropTypes.object.isRequired,
    isSearchQuery: PropTypes.bool.isRequired,
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
    return reduceDocumentationTree(this.props.documentationTree, this.createRowRender, []);
  },

  createRowRender(resultTableRowsArray, nodeType, node, parentNode) {
    const { openedRows, isSearchQuery } = this.props;
    switch (nodeType) {
      case rowTypes.BUCKET_ROW: {
        const bucketId = node.get('id');
        const bucketDescription = node.get('bucketDescription');
        resultTableRowsArray.push(
          this.renderOneTableRow(bucketId, bucketId, bucketDescription, nodeType)
        );
        break;
      }
      case rowTypes.TABLE_ROW: {
        const tableId = node.get('id');
        const tableName = node.get('name');
        const tableDescription = node.get('tableDescription');
        const bucketId = parentNode.get('id');
        if (openedRows.get(rowTypes.BUCKET_ROW + bucketId) || isSearchQuery) {
          resultTableRowsArray.push(
            this.renderOneTableRow(tableId, tableName, tableDescription, nodeType)
          );
        }
        break;
      }
      case rowTypes.COLUMN_ROW: {
        const tableId = parentNode.get('id');
        const column = node.get('column');
        const columnDescription = node.get('description');
        if (openedRows.get(rowTypes.TABLE_ROW + tableId) || this.props.isSearchQuery) {
          resultTableRowsArray.push(
            this.renderOneTableRow(tableId + column, column, columnDescription, nodeType)
          );
        }
        break;
      }
      default:
    }
    return resultTableRowsArray;
  },

  renderOneTableRow(id, name, description, rowType) {
    const pointerClass = !this.props.isSearchQuery ? 'kbc-cursor-pointer ' : '';
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
    const caret = !this.props.isSearchQuery ? <i className={caretClass} /> : null;

    return (
      <tr key={id}>
        <td className="text-nowrap">
          <div
            className={divClassName}
            onClick={() => this.props.toggleDocumentationRow(rowType + id, !isOpened)}
          >
            {rowType !== rowTypes.COLUMN_ROW && caret} <i className={rowTypeClassName} /> {name}
          </div>
        </td>
        <td className="kbc-break-all kbc-break-word">
          {description ? <Markdown source={description} collapsible={true} /> : 'N/A'}
        </td>
      </tr>
    );
  }
});
