import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { Table, SplitButton, MenuItem } from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';
import { Navigation } from 'react-router';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';
import Markdown from '../../../../../react/common/Markdown';
import { SearchBar, Loader } from '@keboola/indigo-ui';

import {prepareStructure, rowTypes, buildDocumentationToMarkdown} from '../../../DocumentationUtils';

import { toggleDocumentationRow, updateDocumentationSearchQuery, uploadFile, loadLastDocumentationSnapshot } from '../../../Actions';



const UPLOAD_SNAPSHOT = 'upload-documentation-snapshot';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore, FilesStore), Navigation],

  getStateFromStores() {
    const allBuckets = BucketsStore.getAll().sortBy((bucket) => bucket.get('id').toLowerCase());
    const allTables = TablesStore.getAll();
    const searchQuery = DocumentationLocalStore.getSearchQuery();
    const enhancedBuckets = prepareStructure(allBuckets, allTables, searchQuery);
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
            <SearchBar
              className="storage-search-bar"
              placeholder="Search in names or descriptions"
              query={this.state.searchQuery}
              onChange={updateDocumentationSearchQuery}
              additionalActions={
                <SplitButton
                  id="documentation-snapshots-button"
                  bsStyle="primary"
                  disabled={isSnapshoting}
                  title={
                    <span>
                      {isSnapshoting ? <Loader /> : <i className="fa fa-arrow-circle-o-up" />} Create Snapshot
                    </span>
                  }
                  onClick={this.snapshotDocumentation}
                  pullRight
                >
                  <MenuItem
                    className="text-right"
                    href={this.makeHref('storage-explorer-files', {}, { q: 'tags:storage-documentation' })}
                  >
                    Show All Snapshots
                  </MenuItem>
                  {lastSnapshot && (
                    <MenuItem
                      className="text-right"
                      href={lastSnapshot.get('url')}
                      target="_blank"
                    >
                      Load Last Snapshot
                    </MenuItem>
                  )}
                </SplitButton>
              }
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
    const documentationArray = buildDocumentationToMarkdown(this.state.enhancedBuckets);
    const currentProject = ApplicationStore.getCurrentProject();
    const projectId = currentProject.get('id');
    const projectName = currentProject.get('name');
    const createdDate = new Date().toISOString();
    const basicInfoArray = [
      `# Documentation of ${projectName}(${projectId}) project \n`,
      `created ${createdDate}\n`
    ];

    let file = new Blob(basicInfoArray.concat(documentationArray), { type: 'text/plain' });
    const params = {
      isPublic: true,
      isPermanent: true,
      tags: ['storage-documentation']
    };
    file.name = 'documentation';
    return uploadFile(UPLOAD_SNAPSHOT, file, params).then(() => {
      ApplicationActionCreators.sendNotification({ message: 'Storage documentation snapshot created' });
      return loadLastDocumentationSnapshot();
    });
  },

  renderEnhancedBucketsRows() {
    return this.state.enhancedBuckets.reduce((bucketsMemo, bucket) => {
      const bucketId = bucket.get('id');
      bucketsMemo.push(
        this.renderOneTableRow(bucketId, bucketId, bucket.get('bucketDescription'), rowTypes.BUCKET_ROW)
      );
      if (!this.state.openedRows.get(rowTypes.BUCKET_ROW + bucketId) && !this.state.searchQuery) {
        return bucketsMemo;
      }
      const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
        const tableId = table.get('id');
        tablesMemo.push(
          this.renderOneTableRow(tableId, table.get('name'), table.get('tableDescription'), rowTypes.TABLE_ROW)
        );
        if (!this.state.openedRows.get(rowTypes.TABLE_ROW + tableId) && !this.state.searchQuery) {
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
    const pointerClass = !this.state.searchQuery ? 'kbc-cursor-pointer ' : '';
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
    const isOpened = this.state.openedRows.get(rowType + id);
    const caretClass = isOpened ? 'fa fa-caret-down' : 'fa fa-caret-right';
    const caret = !this.state.searchQuery ? <i className={caretClass} /> : null;

    return (
      <tr key={id}>
        <td className="text-nowrap">
          <div className={divClassName} onClick={() => toggleDocumentationRow(rowType + id, !isOpened)}>
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
