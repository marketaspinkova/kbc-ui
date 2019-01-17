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
import { navigateToBucketDetail } from '../../Actions';

export default React.createClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(BucketsStore, TablesStore, ApplicationStore)],

  getStateFromStores() {
    return {
      allBuckets: BucketsStore.getAll(),
      allTables: TablesStore.getAll(),
      isLoading: BucketsStore.getIsLoading(),
      sapiToken: ApplicationStore.getSapiToken(),
      isCreatingBucket: BucketsStore.isCreatingBucket()
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
      <div className="storage-buckets-sidebar">
        {this.renderCreateBucketModal()}

        <SearchBar
          placeholder="Search bucket"
          query={this.state.searchQuery}
          onChange={this.handleQueryChange}
          additionalActions={this.renderBucketsButtons()}
        />
        <BucketsList buckets={this.filteredBuckets()} tables={this.state.allTables} />
      </div>
    );
  },

  renderBucketsButtons() {
    return (
      <ButtonGroup>
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
    );
  },

  renderCreateBucketModal() {
    return (
      <CreateBucketModal
        openModal={this.state.createBucketModal}
        hasMysql={!!this.state.sapiToken.getIn(['owner', 'hasMysql'])}
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

    return buckets;
  },

  handleRefresh() {
    StorageActionCreators.loadBucketsForce();
  },

  handleCreateBucket(newBucket) {
    return StorageActionCreators.createBucket(newBucket).then(bucket => {
      navigateToBucketDetail(bucket.id);
    });
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
