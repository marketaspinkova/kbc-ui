import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { SplitButton, MenuItem } from 'react-bootstrap';
import NavButtons from '../../components/NavButtons';
import { Navigation } from 'react-router';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import DocumentationTable from './DocumentationTable';

import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import DocumentationLocalStore from '../../../DocumentationLocalStore';

import { SearchBar, Loader } from '@keboola/indigo-ui';

import {createDocumentationTree, buildDocumentationToMarkdown} from '../../../DocumentationUtils';

import {toggleDocumentationRow, updateDocumentationSearchQuery, uploadFile, loadLastDocumentationSnapshot } from '../../../Actions';



const UPLOAD_SNAPSHOT = 'upload-documentation-snapshot';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore, TablesStore, DocumentationLocalStore, FilesStore), Navigation],

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
            <DocumentationTable
              documentationTree={this.state.documentationTree}
              openedRows={this.state.openedRows}
              searchQuery={this.state.searchQuery}
              toggleDocumentationRow={toggleDocumentationRow}
            />
          </div>
        </div>
      </div>
    );
  },

  snapshotDocumentation() {
    const documentationArray = buildDocumentationToMarkdown(this.state.documentationTree);
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
  }
});
