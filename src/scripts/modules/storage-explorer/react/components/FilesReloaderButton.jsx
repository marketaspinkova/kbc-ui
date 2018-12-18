import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import StorageActionCreators from '../../../components/StorageActionCreators';
import FilesStore from '../../../components/stores/StorageFilesStore';
import LocalStore from '../../LocalStore';
import { searchLimit } from '../../Constants';
import { RefreshIcon } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [createStoreMixin(FilesStore, LocalStore)],

  getStateFromStores() {
    return {
      searchQuery: LocalStore.getSearchQuery(),
      isLoading: FilesStore.getIsLoading()
    };
  },

  handleRefreshClick() {
    const params = {
      limit: searchLimit
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
