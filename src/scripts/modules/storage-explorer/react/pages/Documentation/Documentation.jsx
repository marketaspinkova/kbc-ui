import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { SplitButton, MenuItem } from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';
import { Navigation } from 'react-router';
import DocumentationTable from './DocumentationTable';
import { SearchBar, Loader } from '@keboola/indigo-ui';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';

import { createDocumentationTree, buildDocumentationToMarkdown } from './DocumentationUtils';

import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import {
  toggleDocumentationRow,
  updateDocumentationSearchQuery,
  uploadFile,
  loadLastDocumentationSnapshot
} from '../../../Actions';

const UPLOAD_SNAPSHOT = 'upload-documentation-snapshot';
const STORAGE_DOCUMENTATION_TAG = 'storage-documentation';

export default createReactClass({
  mixins: [
    createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore, FilesStore),
    Navigation
  ],

  getStateFromStores() {
    const allBuckets = BucketsStore.getAll().sortBy((bucket) => bucket.get('id').toLowerCase());
    const allTables = TablesStore.getAll();
    const searchQuery = DocumentationLocalStore.getSearchQuery();
    const documentationTree = createDocumentationTree(allBuckets, allTables, searchQuery);
    return {
      snapshotingProgress: FilesStore.getUploadingProgress(UPLOAD_SNAPSHOT) || 0,
      documentationTree,
      searchQuery,
      lastSnapshot: DocumentationLocalStore.getLastSnapshot(),
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
              placeholder="Search in names or descriptions"
              query={this.state.searchQuery}
              onChange={updateDocumentationSearchQuery}
              additionalActions={this.renderSearchbarAdditionalActions()}
            />
            <DocumentationTable
              documentationTree={this.state.documentationTree}
              openedRows={this.state.openedRows}
              isSearchQuery={!!this.state.searchQuery}
              toggleDocumentationRow={toggleDocumentationRow}
            />
          </div>
        </div>
      </div>
    );
  },

  renderSearchbarAdditionalActions() {
    const isSnapshoting =
      this.state.snapshotingProgress > 0 && this.state.snapshotingProgress < 100;
    const lastSnapshot = this.state.lastSnapshot;
    return (
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
          href={this.makeHref(
            'storage-explorer-files',
            {},
            { q: `tags:${STORAGE_DOCUMENTATION_TAG}` }
          )}
        >
          Show All Snapshots
        </MenuItem>
        {lastSnapshot && (
          <MenuItem className="text-right" href={lastSnapshot.get('url')} target="_blank">
            Load Last Snapshot
          </MenuItem>
        )}
      </SplitButton>
    );
  },

  snapshotDocumentation() {
    const currentProject = ApplicationStore.getCurrentProject();
    const projectId = currentProject.get('id');
    const projectName = currentProject.get('name');
    const stringArray = buildDocumentationToMarkdown(
      this.state.documentationTree,
      projectId,
      projectName
    );
    const params = {
      isPublic: true,
      isPermanent: true,
      tags: [STORAGE_DOCUMENTATION_TAG]
    };
    let file = new Blob(stringArray, { type: 'text/plain' });
    file.name = 'documentation.md';

    return uploadFile(UPLOAD_SNAPSHOT, file, params).then(() => {
      ApplicationActionCreators.sendNotification({
        message: 'Storage documentation snapshot created'
      });
      return loadLastDocumentationSnapshot();
    });
  }
});
