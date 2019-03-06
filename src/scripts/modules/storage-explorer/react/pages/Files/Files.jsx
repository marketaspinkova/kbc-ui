import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { Navigation } from 'react-router';
import { SearchBar } from '@keboola/indigo-ui';

import Tooltip from '../../../../../react/common/Tooltip';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import FilesLocalStore from '../../../FilesLocalStore';
import FilesTable from '../../components/FilesTable';
import NavButtons from '../../components/NavButtons';
import UploadModal from '../../modals/UploadModal';
import ExamplesModal from '../../modals/FilesSearchExamplesModal';
import {
  uploadFile,
  deleteFile,
  loadFiles,
  loadMoreFiles,
  filterFiles,
  updateFilesSearchQuery,
  resetFilesSearchQuery
} from '../../../Actions';
import { filesLimit } from '../../../Constants';

const DIRECT_UPLOAD = 'direct-upload';

export default React.createClass({
  mixins: [PureRenderMixin, Navigation, createStoreMixin(FilesStore, FilesLocalStore)],

  getStateFromStores() {
    return {
      files: FilesStore.getAll(),
      hasMore: FilesStore.hasMoreFiles(),
      searchQuery: FilesLocalStore.getSearchQuery(),
      isLoadingMore: FilesStore.getIsLoadingMore(),
      isDeleting: FilesStore.getIsDeleting(),
      uploadingProgress: FilesStore.getUploadingProgress(DIRECT_UPLOAD) || 0
    };
  },

  componentWillUnmount() {
    resetFilesSearchQuery();
  },

  getInitialState() {
    return {
      openExamplesModal: false,
      openUploadModal: false
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="storage-explorer">
            <NavButtons />
            <SearchBar
              className="storage-search-bar"
              placeholder="Search: tags:tag"
              query={this.state.searchQuery}
              onChange={this.updateSearchQuery}
              onSubmit={() => {
                filterFiles(this.state.searchQuery);
              }}
              additionalActions={
                <ButtonToolbar>
                  <Tooltip tooltip="Search syntax &amp; Examples" placement="top">
                    <Button bsStyle="default" onClick={this.openExamplesModal}>
                      <i className="fa fa-question-circle" />
                    </Button>
                  </Tooltip>
                  <Button bsStyle="primary" onClick={this.openUploadModal}>
                    <i className="fa fa-arrow-circle-o-up" /> Upload File
                  </Button>
                </ButtonToolbar>
              }
            />

            {this.state.files.count() === 0 ? (
              <p className="kbc-inner-padding">No files.</p>
            ) : (
              <div>
                <FilesTable
                  files={this.state.files}
                  onSearchQuery={filterFiles}
                  onDeleteFile={this.handleDeleteFile}
                  isDeleting={this.state.isDeleting}
                />
                {this.renderMoreButton()}
              </div>
            )}

            {this.renderUploadModal()}
            {this.renderExamplesModal()}
          </div>
        </div>
      </div>
    );
  },

  renderMoreButton() {
    if (!this.state.files || !this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding">
        <Button onClick={this.fetchMoreFiles} disabled={this.state.isLoadingMore}>
          {this.state.isLoadingMore ? 'Loading ...' : 'Load more'}
        </Button>
      </div>
    );
  },

  renderUploadModal() {
    return (
      <UploadModal
        show={this.state.openUploadModal}
        uploadingProgress={this.state.uploadingProgress}
        onConfirm={this.handleUploadFile}
        onHide={this.closeUploadModal}
      />
    );
  },

  renderExamplesModal() {
    return (
      <ExamplesModal
        show={this.state.openExamplesModal}
        onHide={this.closeExamplesModal}
        onSelectExample={filterFiles}
      />
    );
  },

  openUploadModal() {
    this.setState({
      openUploadModal: true
    });
  },

  closeUploadModal() {
    this.setState({
      openUploadModal: false
    });
  },

  openExamplesModal() {
    this.setState({
      openExamplesModal: true
    });
  },

  closeExamplesModal() {
    this.setState({
      openExamplesModal: false
    });
  },

  handleUploadFile(file, params) {
    return uploadFile(DIRECT_UPLOAD, file, params).then(() => this.fetchFiles());
  },

  handleDeleteFile(fileId) {
    return deleteFile(fileId);
  },

  getSearchParams(offset) {
    const params = {
      limit: filesLimit,
      offset
    };

    if (this.state.searchQuery) {
      params.q = this.state.searchQuery;
    }

    return params;
  },

  fetchFiles(offset = 0) {
    loadFiles(this.getSearchParams(offset));
  },

  fetchMoreFiles() {
    const offset = this.state.files.count();
    return loadMoreFiles(this.getSearchParams(offset));
  },

  updateSearchQuery(query) {
    updateFilesSearchQuery(query);
  }
});
