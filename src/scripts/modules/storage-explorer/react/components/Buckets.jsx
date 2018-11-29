import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { ButtonGroup, Button } from 'react-bootstrap';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import matchByWords from '../../../../utils/matchByWords';
import Tooltip from '../../../../react/common/Tooltip';
import BucketsStore from '../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../components/stores/StorageTablesStore';
import StorageActionCreators from '../../../components/StorageActionCreators';
import CreateBucketModal from '../modals/CreateBucketModal';
import BucketsList from './BucketsList';

export default React.createClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(BucketsStore, TablesStore, ApplicationStore)],

  getStateFromStores() {
    return {
      allBuckets: BucketsStore.getAll(),
      allTables: TablesStore.getAll(),
      isLoading: BucketsStore.getIsLoading(),
      sapiToken: ApplicationStore.getSapiToken(),
      isCreatingBucket: BucketsStore.isCreatingBucket(),
      deletingBuckets: BucketsStore.deletingBuckets(),
      isCreatingAliasTable: TablesStore.getIsCreatingAliasTable()
    };
  },

  getInitialState() {
    return {
      searchQuery: '',
      createBucketModal: false
    };
  },

  render() {
    return (
      <div className="kbc-main-content">
        <div className="kbc-inner-padding">
          {this.renderCreateBucketModal()}

          <SearchBar query={this.state.searchQuery} onChange={this.handleQueryChange} />

          <h3>
            {this.renderBucketsButtons()}
            Buckets
          </h3>
        </div>

        <BucketsList
          buckets={this.filteredBuckets()}
          tables={this.state.allTables}
          sapiToken={this.state.sapiToken}
          onDeleteBucket={this.handleDeleteBucket}
          onCreateAliasTable={this.handleCreateAliasTable}
          deletingBuckets={this.state.deletingBuckets}
          isCreatingAliasTable={this.state.isCreatingAliasTable}
        />
      </div>
    );
  },

  renderBucketsButtons() {
    return (
      <div className="pull-right">
        <ButtonGroup bsSize="small">
          <Tooltip tooltip="Create new bucket" placement="top">
            <Button onClick={this.openCreateBucketModal}>
              <i className="fa fa-plus" />
            </Button>
          </Tooltip>
          <Tooltip tooltip="Refresh buckets" placement="top">
            <Button onClick={this.handleRefresh}>
              <RefreshIcon isLoading={this.state.isLoading} title="" />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </div>
    );
  },

  renderCreateBucketModal() {
    return (
      <CreateBucketModal
        openModal={this.state.createBucketModal}
        hasRedshift={!!this.state.sapiToken.getIn(['owner', 'hasRedshift'])}
        hasSnowflake={!!this.state.sapiToken.getIn(['owner', 'hasSnowflake'])}
        defaultBackend={this.state.sapiToken.getIn(['owner', 'defaultBackend'])}
        onSubmit={this.handleCreateBucket}
        onHide={this.closeCreateBucketModal}
        isSaving={this.state.isCreatingBucket}
      />
    );
  },

  filteredBuckets() {
    let buckets = this.state.allBuckets;

    if (this.state.searchQuery) {
      const search = this.state.searchQuery.toLowerCase();

      buckets = buckets.filter(bucket => matchByWords(bucket.get('id').toLowerCase(), search));
    }

    return buckets.sortBy(bucket => bucket.get('name').toLowerCase());
  },

  handleRefresh() {
    StorageActionCreators.loadBucketsForce();
  },

  handleCreateBucket(newBucket) {
    return StorageActionCreators.createBucket(newBucket);
  },

  handleDeleteBucket(bucketId, force) {
    return StorageActionCreators.deleteBucket(bucketId, force);
  },

  handleCreateAliasTable(buckedId, params) {
    return StorageActionCreators.createAliasTable(buckedId, params);
  },

  handleQueryChange(query) {
    this.setState({
      searchQuery: query
    });
  },

  openCreateBucketModal() {
    this.setState({
      createBucketModal: true
    });
  },

  closeCreateBucketModal() {
    this.setState({
      createBucketModal: false
    });
  }
});
