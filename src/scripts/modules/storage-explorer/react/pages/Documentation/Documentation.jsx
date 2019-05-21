import React from 'react';
import { List, Map } from 'immutable';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { Table, Button } from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';
import { Link } from 'react-router';
import FileLink from '../../../../sapi-events/react/FileLink';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';
import Markdown from '../../../../../react/common/Markdown';
import { SearchBar, Loader, Finished } from '@keboola/indigo-ui';
import matchByWords from '../../../../../utils/matchByWords';

import { toggleDocumentationRow, updateDocumentationSearchQuery, uploadFile, loadLastDocumentationSnapshot } from '../../../Actions';

const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

const UPLOAD_SNAPSHOT = 'upload-documentation-snapshot';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore, FilesStore)],

  getStateFromStores() {
    const allBuckets = BucketsStore.getAll().sortBy((bucket) => bucket.get('id').toLowerCase());
    const allTables = TablesStore.getAll();
    const searchQuery = DocumentationLocalStore.getSearchQuery();
    const enhancedBuckets = this.prepareStructure(allBuckets, allTables, searchQuery);
    return {
      snapshotingProgress: FilesStore.getUploadingProgress(UPLOAD_SNAPSHOT) || 0,
      enhancedBuckets,
      searchQuery,
      lastSnapshot: DocumentationLocalStore.getLastSnapshot(),
      openedRows: DocumentationLocalStore.getOpenedRows()
    };
  },

  render() {
    const isSnapshoting = this.state.snapshotingProgress > 0 && this.state.snapshotingProgress < 100;
    const lastSnapshot = this.state.lastSnapshot;
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="storage-explorer storage-documentation">
            <NavButtons />
            <div className="col-sm-12">
              <div className="col-sm-4">
                <Button disabled={isSnapshoting}
                  bsStyle="primary"
                  onClick={this.snapshotDocumentation}>
                  Create Documentation Snapshot
                {isSnapshoting && <Loader />}
                </Button>
              </div>
              <div className="col-sm-8">
                <Link to="storage-explorer-files" query={{ q: 'tags:storage-documentation' }}>
                    All Documentation Snapshots
                </Link>
                <div>
                  {lastSnapshot ?
                    <div>
                      <FileLink file={lastSnapshot} showFilesize={false}>
                        Last Documentation Snapshot
                      </FileLink>
                      - <Finished showIcon endTime={lastSnapshot.get('created')} />
                      {' by '}
                      {lastSnapshot.getIn(['creatorToken', 'description'])}
                    </div>
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
            <SearchBar
              className="storage-search-bar"
              placeholder="Search in names or descriptions"
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

  snapshotDocumentation() {
    const documentationArray = this.buildDocumentationToMarkdown();
    let file = new Blob(documentationArray, { type: 'text/plain' });
    const params = {
      isPublic: true,
      isPermanent: true,
      tags: ['storage-documentation']
    };
    file.name = 'documentation';
    return uploadFile(UPLOAD_SNAPSHOT, file, params).then(result => result).then(loadLastDocumentationSnapshot);
  },

  buildDocumentationToMarkdown() {
    return this.state.enhancedBuckets.reduce((bucketsMemo, bucket) => {
      const bucketId = bucket.get('id');
      bucketsMemo.push(
        this.createMarkdownPart(bucketId, bucket.get('bucketDescription'), BUCKET_ROW)
      );
      const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
        tablesMemo.push(
          this.createMarkdownPart(table.get('name'), table.get('tableDescription'), TABLE_ROW)
        );
        const columnsRows = table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
          columnsMemo.push(this.createMarkdownPart(column, description, COLUMN_ROW));
          return columnsMemo;
        }, []);
        return tablesMemo.concat(columnsRows);
      }, []);
      return bucketsMemo.concat(bucketTablesRows);
    }, []);
  },

  createMarkdownPart(name, partDescription, partType) {
    const description = partDescription || 'N/A';
    switch (partType) {
      case BUCKET_ROW:
        return `## ${name} \n ${description}\n`;
      case TABLE_ROW:
        return `### ${name} \n ${description}\n`;
      case COLUMN_ROW:
        return `### ${name} \n ${description}\n`;
    }

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
    const pointerClass = !this.state.searchQuery ? 'kbc-cursor-pointer ' : '';
    let divClassName = pointerClass + 'bucket-row';

    let rowTypeClassName = 'fa fa-folder';
    if (rowType === TABLE_ROW) {
      divClassName = pointerClass + 'table-row';
      rowTypeClassName = 'fa fa-table';
    }
    if (rowType === COLUMN_ROW) {
      divClassName = 'column-row';
      rowTypeClassName = 'fa fa-columns';
    }
    const isOpened = this.state.openedRows.get(rowType + id);
    const caretClass = isOpened ? 'fa fa-caret-down' : 'fa fa-caret-right';
    const caret = !this.state.searchQuery ? <i className={caretClass} /> : null;

    return (
      <tr key={id}>
        <td className="text-nowrap">
          <div className={divClassName} onClick={() => toggleDocumentationRow(rowType + id, !isOpened)}>
            {rowType !== COLUMN_ROW && caret}
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
            ).filter((columnDescription, columnName) =>
              this.matchDescriptionOrName(columnDescription, columnName, searchQuery)
            );
          const tableDescription = this.getDescription(table.get('metadata'));
          return table
            .set('tableDescription', tableDescription)
            .set('columnsDescriptions', columnsDescriptions);
        })
        .filter(table => {
          if (searchQuery) {
            return this.matchDescriptionOrName(table.get('tableDescription'), table.get('name'), searchQuery) || table.get('columnsDescriptions').count() > 0;
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
        return this.matchDescriptionOrName(bucket.get('bucketDescription'), bucket.get('id'), searchQuery) || bucket.get('bucketTables').count() > 0;
      } else {
        return true;
      }

    });
  },

  matchDescriptionOrName(description, name, searchQuery) {
    if (searchQuery) {
      return matchByWords(name, searchQuery) || matchByWords(description || '', searchQuery);
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
