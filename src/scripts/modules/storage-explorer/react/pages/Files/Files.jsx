import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Button } from 'react-bootstrap';
import { SearchBar } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import FilesLocalStore from '../../../FilesLocalStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';
import FilesTable from '../../components/FilesTable';
import NavButtons from '../../components/NavButtons';
import UploadModal from '../../modals/UploadModal';
import { updateSearchQuery, resetSearchQuery } from '../../../Actions';
import { filesLimit } from '../../../Constants';

const DIRECT_UPLOAD = 'direct-upload';

export default React.createClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(FilesStore, FilesLocalStore)],

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
              onChange={this.handleQueryChange}
              onSubmit={this.fetchFiles}
              additionalActions={
                <Button bsStyle="primary" onClick={this.openUploadModal}>
                  <i className="fa fa-arrow-circle-o-up" /> Upload File
                </Button>
              }
            />
          </div>

          {this.state.files.count() === 0 ? (
            <p className="kbc-inner-padding">No files.</p>
          ) : (
            <div>
              <FilesTable
                files={this.state.files}
                onSearchByTag={this.searchByTag}
                onDeleteFile={this.handleDeleteFile}
                isDeleting={this.state.isDeleting}
              />
              {this.renderMoreButton()}
            </div>
          )}
        </div>

        {this.renderUploadModal()}
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

  handleQueryChange(query) {
    updateSearchQuery(query);
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

  handleUploadFile(file, params) {
    return StorageActionCreators.uploadFile(DIRECT_UPLOAD, file, params).then(() => this.fetchFiles());
  },

  searchByTag(tag) {
    updateSearchQuery(`tags:${tag}`);
    setTimeout(this.fetchFiles, 50);
  },

  handleDeleteFile(fileId) {
    return StorageActionCreators.deleteFile(fileId);
  },

  getParams(offset) {
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
    StorageActionCreators.loadFilesForce(this.getParams(offset));
  },

  fetchMoreFiles() {
    const offset = this.state.files.count();
    return StorageActionCreators.loadMoreFiles(this.getParams(offset));
  }
});
