import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import FilesStore from '../../../components/stores/StorageFilesStore';
import FilesLocalStore from '../../FilesLocalStore';
import { filesLimit } from '../../Constants';
import { loadFiles } from '../../Actions';
import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
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

    return loadFiles(params);
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this.handleRefreshClick} />;
  }
});
