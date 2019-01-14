import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import StorageActionCreators from '../../../components/StorageActionCreators';
import FilesStore from '../../../components/stores/StorageFilesStore';
import FilesLocalStore from '../../FilesLocalStore';
import { filesLimit } from '../../Constants';
import { RefreshIcon } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [createStoreMixin(FilesStore, FilesLocalStore)],

  getStateFromStores() {
    return {
      searchQuery: FilesLocalStore.getSearchQuery(),
      isLoading: FilesStore.getIsLoading()
    };
  },

  handleRefreshClick() {
    const params = {
      limit: filesLimit
    };

    if (this.state.searchQuery) {
      params.q = this.state.searchQuery;
    }

    return StorageActionCreators.loadFilesForce(params);
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this.handleRefreshClick} />;
  }
});
