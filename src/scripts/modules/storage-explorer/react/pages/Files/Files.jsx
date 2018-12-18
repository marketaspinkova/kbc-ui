import React from 'react';
import Promise from 'bluebird';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Button } from 'react-bootstrap';
import { SearchBar, Loader } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import LocalStore from '../../../LocalStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';
import FilesTable from '../../components/FilesTable';
import UploadModal from '../../modals/UploadModal';
import { updateSearchQuery, resetSearchQuery } from '../../../Actions';
import { searchLimit } from '../../../Constants';

export default React.createClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(FilesStore, LocalStore)],

  getStateFromStores() {
    return {
      files: FilesStore.getAll(),
      searchQuery: LocalStore.getSearchQuery(),
      isLoading: FilesStore.getIsLoading(),
      isLoadingMore: FilesStore.getIsLoadingMore(),
      isDeleting: FilesStore.getIsDeleting()
    };
  },

  componentWillUnmount() {
    resetSearchQuery();
  },

  getInitialState() {
    return {
      openUploadModal: false,
      isUploading: false,
      hasMore: true
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
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

          {this.state.isLoading ? (
            <p className="kbc-inner-padding">
              <Loader /> loading...
            </p>
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

        {this.state.openUploadModal && this.renderUploadModal()}
      </div>
    );
  },

  renderMoreButton() {
    if (!this.state.files || !this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding">
        <Button onClick={this.handleLoadMore} disabled={this.state.isLoadingMore}>
          {this.state.isLoadingMore ? 'Loading ...' : 'Load more'}
        </Button>
      </div>
    );
  },

  renderUploadModal() {
    return (
      <UploadModal
        uploading={this.state.isUploading}
        progress={0}
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

  handleUploadFile(params) {
    this.setState({ isUploading: true });

    return Promise.resolve(params).finally(() => {
      this.setState({ isUploading: false });
    });
  },

  searchByTag(tag) {
    this.setState({ searchQuery: `tags:${tag}` }, this.fetchFiles);
  },

  handleDeleteFile(fileId) {
    return StorageActionCreators.deleteFile(fileId);
  },

  handleLoadMore() {
    this.fetchMoreFiles().then(files => {
      this.setState({
        hasMore: files.length === this.state.count,
        offset: this.state.offset + this.state.count
      });
    });
  },

  getParams(offset) {
    const params = {
      limit: searchLimit,
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
