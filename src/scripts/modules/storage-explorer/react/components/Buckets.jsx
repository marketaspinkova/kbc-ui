import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import BucketsStore from '../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../components/stores/StorageTablesStore';
import StorageActionCreators from '../../../components/StorageActionCreators';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';
import BucketsList from './BucketsList';

export default React.createClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(BucketsStore, TablesStore)],

  getStateFromStores() {
    return {
      allBuckets: BucketsStore.getAll(),
      allTables: TablesStore.getAll(),
      isLoading: BucketsStore.getIsLoading()
    };
  },

  getInitialState() {
    return {
      searchQuery: ''
    };
  },

  render() {
    return (
      <div className="kbc-main-content">
        <div className="kbc-inner-padding">
          <SearchBar query={this.state.searchQuery} onChange={this.handleQueryChange} />

          <h3 style={{ marginBottom: 0 }}>
            <div className="pull-right">
              <RefreshIcon onClick={this.handleRefresh} isLoading={this.state.isLoading} />
            </div>
            Buckets
          </h3>
        </div>

        <BucketsList buckets={this.filteredBuckets()} tables={this.state.allTables} />
      </div>
    );
  },

  filteredBuckets() {
    let buckets = this.state.allBuckets;

    if (this.state.searchQuery) {
      const search = this.state.searchQuery.toLowerCase();

      buckets = buckets.filter(
        bucket =>
          bucket
            .get('id')
            .toLowerCase()
            .indexOf(search) > -1
      );
    }

    return buckets.sortBy(bucket => bucket.get('name').toLowerCase());
  },

  handleRefresh() {
    StorageActionCreators.loadBucketsForce();
  },

  handleQueryChange(query) {
    this.setState({
      searchQuery: query
    });
  }
});
