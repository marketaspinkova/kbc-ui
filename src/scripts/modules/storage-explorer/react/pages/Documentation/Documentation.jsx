import React from 'react';
import { List, Map } from 'immutable';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { Table} from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';
import Markdown from '../../../../../react/common/Markdown';
import { SearchBar } from '@keboola/indigo-ui';
import matchByWords from '../../../../../utils/matchByWords';

import {toggleDocumentationRow, updateDocumentationSearchQuery} from '../../../Actions';

const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore)],

  getStateFromStores() {
    const allBuckets = BucketsStore.getAll().sortBy((bucket) => bucket.get('id').toLowerCase());
    const allTables = TablesStore.getAll();
    const searchQuery = DocumentationLocalStore.getSearchQuery();
    const enhancedBuckets = this.prepareStructure(allBuckets, allTables, searchQuery);
    return {
      enhancedBuckets,
      searchQuery,
      openedRows: DocumentationLocalStore.getOpenedRows()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="storage-explorer storage-documentation">
            <NavButtons />
            <SearchBar
              className="storage-search-bar"
              placeholder="Search in descriptions"
              query={this.state.searchQuery}
              onChange={updateDocumentationSearchQuery}
            />
            <Table striped responsive>
              <tbody>{this.renderEnhancedBucketsRows()}</tbody>
            </Table>
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
      if (!this.state.openedRows.get(BUCKET_ROW + bucketId) && !this.state.searchQuery) {
        return bucketsMemo;
      }
      const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
        const tableId = table.get('id');
        tablesMemo.push(
          this.renderOneTableRow(tableId, table.get('name'), table.get('tableDescription'), TABLE_ROW)
        );
        if (!this.state.openedRows.get(TABLE_ROW + tableId) && !this.state.searchQuery) {
          return tablesMemo;
        }
        const columnsRows = table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
          // const description = table.getIn(['columnsDescriptions', column]);
          columnsMemo.push(this.renderOneTableRow(tableId + column, column, description, COLUMN_ROW));
          return columnsMemo;
        }, []);
        return tablesMemo.concat(columnsRows);
      }, []);
      return bucketsMemo.concat(bucketTablesRows);
    }, []);
  },

  renderOneTableRow(id, name, description, rowType) {
    let className = 'kbc-cursor-pointer bucket-row';
    let rowTypeClassName = 'fa fa-folder';
    if (rowType === TABLE_ROW) {
      className = 'kbc-cursor-pointer table-row';
      rowTypeClassName = 'fa fa-table';
    }
    if (rowType === COLUMN_ROW) {
      className = 'column-row';
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
        <td className="kbc-break-all kbc-break-word">
          {description ? <Markdown source={description} collapsible={true} /> : 'N/A'}
        </td>
      </tr>
    );
  },

  prepareStructure(buckets, tables, searchQuery) {
    return buckets.map((bucket) => {
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
            ).filter((columnDescription) =>
              this.matchDescription(columnDescription, searchQuery)
            );
          const tableDescription = this.getDescription(table.get('metadata'));
          return table
            .set('tableDescription', tableDescription)
            .set('columnsDescriptions', columnsDescriptions);
        })
        .filter(table => {
          if (searchQuery) {
            return this.matchDescription(table.get('tableDescription'), searchQuery) || table.get('columnsDescriptions').count() > 0;
          } else {
            return true;
          }
        });
      const description = this.getDescription(bucket.get('metadata'));
      return bucket
        .set('bucketTables', bucketTables)
        .set('bucketDescription', description);
    }).filter(bucket => {
      if (searchQuery) {
        return this.matchDescription(bucket.get('bucketDescription'), searchQuery) || bucket.get('bucketTables').count() > 0;
      } else {
        return true;
      }

    });
  },

  matchDescription(description, searchQuery) {
    if(searchQuery) {
      return matchByWords(description || '', searchQuery);
    } else {
      return true;
    }
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
