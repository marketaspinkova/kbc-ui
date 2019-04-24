import React from 'react';
import { List, Map } from 'immutable';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { Table, Row } from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';
import Markdown from '../../../../../react/common/Markdown';

import {toggleDocumentationRow} from '../../../Actions';

const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore)],

  getStateFromStores() {
    const allBuckets = BucketsStore.getAll().sortBy((bucket) => bucket.get('id').toLowerCase());
    const allTables = TablesStore.getAll();
    const enhancedBuckets = this.prepareStructure(allBuckets, allTables);
    return {
      enhancedBuckets,
      openedRows: DocumentationLocalStore.getOpenedRows()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content reset-overflow">
          <div className="storage-explorer">
            <NavButtons />
            <Row>

              <Table striped>
                <tbody>{this.renderEnhancedBucketsRows()}</tbody>
              </Table>
            </Row>
          </div>
        </div>
      </div>
    );
  },

  renderEnhancedBucketsRows() {
    return this.state.enhancedBuckets.reduce((bucketsMemo, bucket) => {
      const bucketId = bucket.get('id');
      bucketsMemo.push(
        this.renderOneTableRow(bucketId, bucketId, bucket.get('bucketDescription'), BUCKET_ROW)
      );
      if (!this.state.openedRows.get(BUCKET_ROW + bucketId)) {
        return bucketsMemo;
      }
      const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
        const tableId = table.get('id');
        tablesMemo.push(
          this.renderOneTableRow(tableId, table.get('name'), table.get('tableDescription'), TABLE_ROW)
        );
        if (!this.state.openedRows.get(TABLE_ROW + tableId)) {
          return tablesMemo;
        }
        const columnsRows = table.get('columns').reduce((columnsMemo, column) => {
          const description = table.getIn(['columnsDescriptions', column]);
          columnsMemo.push(this.renderOneTableRow(tableId + column, column, description, COLUMN_ROW));
          return columnsMemo;
        }, []);
        return tablesMemo.concat(columnsRows);
      }, []);
      return bucketsMemo.concat(bucketTablesRows);
    }, []);
  },

  renderOneTableRow(id, name, description, rowType) {
    let className = 'kbc-cursor-pointer';
    let rowTypeClassName = 'fa fa-folder';
    if (rowType === TABLE_ROW) {
      className = 'kbc-cursor-pointer col-xs-offset-1';
      rowTypeClassName = 'fa fa-table';
    }
    if (rowType === COLUMN_ROW) {
      className = 'col-xs-offset-2';
      rowTypeClassName = 'fa fa-columns';
    }
    const isOpened = this.state.openedRows.get(rowType + id);
    const caretClass = isOpened ? 'fa fa-caret-down' : 'fa fa-caret-right';

    return (
      <tr key={id}>
        <td className="text-nowrap">
          <div className={className} onClick={() => toggleDocumentationRow(rowType + id, !isOpened)}>
            {rowType !== COLUMN_ROW && <i className={caretClass} /> }
            {' '}
            <i className={rowTypeClassName} />
            {' '}
            {name}
          </div>
        </td>
        <td>{description ? <Markdown source={description} collapsible={true} /> : 'N/A'}</td>
      </tr>
    );
  },

  prepareStructure(buckets, tables) {
    return buckets.map((bucket) => {
      const description = this.getDescription(bucket.get('metadata'));
      const bucketId = bucket.get('id');
      const bucketTables = tables
        .filter((table) => table.getIn(['bucket', 'id']) === bucketId)
        .map((table) => {
          const columnsDescriptions = table
            .get('columns')
            .reduce(
              (memo, column) =>
                memo.set(
                  column,
                  this.getDescription(table.getIn(['columnMetadata', column], List()))
                ),
              Map()
            );
          return table
            .set('tableDescription', this.getDescription(table.get('metadata')))
            .set('columnsDescriptions', columnsDescriptions);
        });
      return bucket.set('bucketTables', bucketTables).set('bucketDescription', description);
    });
  },

  getDescription(metadata) {
    if (metadata) {
      const description = metadata.find((entry) => entry.get('key') === 'KBC.description');
      return description && description.get('value');
    } else {
      return null;
    }
  }
});
