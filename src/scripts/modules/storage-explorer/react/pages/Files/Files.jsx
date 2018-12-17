import React from 'react';
import Promise from 'bluebird';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List, fromJS } from 'immutable';
import { Button } from 'react-bootstrap';
import { RefreshIcon, SearchBar, Loader } from '@keboola/indigo-ui';
import FilesTable from '../../components/FilesTable';
import StorageActionCreators from '../../../../components/StorageActionCreators';

import UploadModal from '../../modals/UploadModal';

const INITIAL_PAGING = {
  count: 50,
  offset: 0
};

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  getInitialState() {
    return {
      files: List(),
      openUploadModal: false,
      isUploading: false,
      isLoadingMore: false,
      isLoading: false,
      hasMore: true,
      searchQuery: '',
      ...INITIAL_PAGING
    };
  },

  componentDidMount() {
    this.loadFiles();
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-inner-padding">
            <h2>
              Files <RefreshIcon onClick={this.resetPagingAndLoadFiles} isLoading={this.state.isLoading} />
              <div className="pull-right">
                <Button bsStyle="primary" onClick={this.openUploadModal}>
                  <i className="fa fa-arrow-circle-o-up" /> Upload File
                </Button>
              </div>
            </h2>
            <SearchBar
              placeholder="Search: tags:tag"
              query={this.state.searchQuery}
              onChange={this.handleQueryChange}
              onSubmit={this.resetPagingAndLoadFiles}
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
                onSearchById={this.searchById}
                onSearchByTag={this.searchByTag}
                onDeleteFile={this.handleDeleteFile}
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

  handleDeleteFile(fileId) {
    return StorageActionCreators.deleteFile(fileId).then(() => {
      this.setState({
        files: this.state.files.filter(file => file.get('id') !== fileId)
      });
    });
  },

  handleQueryChange(query) {
    this.setState({
      searchQuery: query
    });
  },

  loadFiles() {
    this.setState({ isLoading: true });

    this.fetchFiles()
      .then(files => {
        this.setState({
          files: fromJS(files),
          hasMore: files.length === this.state.count,
          offset: this.state.offset + this.state.count
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  },

  resetPagingAndLoadFiles() {
    this.setState(INITIAL_PAGING, this.loadFiles);
  },

  searchById(id) {
    this.setState(
      {
        searchQuery: `id:${id}`
      },
      this.resetPagingAndLoadFiles
    );
  },

  searchByTag(tag) {
    this.setState(
      {
        searchQuery: `tags:${tag}`
      },
      this.resetPagingAndLoadFiles
    );
  },

  handleLoadMore() {
    this.setState({ isLoadingMore: true });

    this.fetchFiles()
      .then(files => {
        this.setState({
          files: this.state.files.concat(fromJS(files)),
          hasMore: files.length === this.state.count,
          offset: this.state.offset + this.state.count
        });
      })
      .finally(() => {
        this.setState({ isLoadingMore: false });
      });
  },

  fetchFiles() {
    const params = {
      limit: this.state.count,
      offset: this.state.offset
    };

    if (this.state.searchQuery) {
      params.q = this.state.searchQuery;
    }

    return StorageActionCreators.loadFilesForce(params);
  }
});
