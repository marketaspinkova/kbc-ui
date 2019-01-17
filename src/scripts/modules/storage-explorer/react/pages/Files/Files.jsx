import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { Navigation } from 'react-router';
import { SearchBar } from '@keboola/indigo-ui';

import Tooltip from '../../../../../react/common/Tooltip';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import FilesLocalStore from '../../../FilesLocalStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';
import FilesTable from '../../components/FilesTable';
import NavButtons from '../../components/NavButtons';
import UploadModal from '../../modals/UploadModal';
import ExamplesModal from '../../modals/FilesSearchExamplesModal';
import { loadFiles, loadMoreFiles, updateSearchQuery, resetSearchQuery } from '../../../Actions';
import { filesLimit } from '../../../Constants';

const DIRECT_UPLOAD = 'direct-upload';

export default React.createClass({
  mixins: [ImmutableRenderMixin, Navigation, createStoreMixin(FilesStore, FilesLocalStore)],

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
    resetSearchQuery();
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
          <NavButtons />
          <div className="kbc-inner-padding">
            <SearchBar
              placeholder="Search: tags:tag"
              query={this.state.searchQuery}
              onChange={this.updateSearchQuery}
              onSubmit={this.fetchFiles}
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
          </div>

          {this.state.files.count() === 0 ? (
            <p className="kbc-inner-padding">No files.</p>
          ) : (
            <div>
              <FilesTable
                files={this.state.files}
                onSearchQuery={this.searchQuery}
                onDeleteFile={this.handleDeleteFile}
                isDeleting={this.state.isDeleting}
              />
              {this.renderMoreButton()}
            </div>
          )}
        </div>

        {this.renderUploadModal()}
        {this.renderExamplesModal()}
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
        onSelectExample={this.searchQuery}
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
    return StorageActionCreators.uploadFile(DIRECT_UPLOAD, file, params).then(() => this.fetchFiles());
  },

  searchQuery(query) {
    this.updateSearchQuery(query);
    setTimeout(this.fetchFiles, 50);
  },

  handleDeleteFile(fileId) {
    return StorageActionCreators.deleteFile(fileId);
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
    updateSearchQuery(query);

    const token = process.env.NODE_ENV === 'development' ? `${window.location.search}#` : '';
    const pathname = this.makePath('storage-explorer-files', null, { q: query });
    window.history.replaceState(null, null, token + pathname);
  }
});
