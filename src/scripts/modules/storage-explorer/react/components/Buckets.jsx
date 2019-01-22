import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import ApplicationStore from '../../../../stores/ApplicationStore';
import BucketsStore from '../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../components/stores/StorageTablesStore';

import matchByWords from '../../../../utils/matchByWords';
import Tooltip from '../../../../react/common/Tooltip';
import CreateBucketModal from '../modals/CreateBucketModal';
import SharedBucketsModal from '../modals/SharedBucketsModal';
import BucketsList from './BucketsList';
import { reloadBuckets, loadSharedBuckets, createBucket } from '../../Actions';

export default React.createClass({
  mixins: [createStoreMixin(ApplicationStore, RoutesStore, BucketsStore, TablesStore)],

  getStateFromStores() {
    return {
      bucketId: RoutesStore.getCurrentRouteParam('bucketId'),
      allBuckets: BucketsStore.getAll(),
      allTables: TablesStore.getAll(),
      sharedBuckets: BucketsStore.getSharedBuckets(),
      isReloading: BucketsStore.getIsReloading(),
      sapiToken: ApplicationStore.getSapiToken(),
      isCreatingBucket: BucketsStore.isCreatingBucket()
    };
  },

  getInitialState() {
    return {
      searchQuery: '',
      createBucketModal: false,
      linkBucketModal: false
    };
  },

  render() {
    return (
      <div className="storage-buckets-sidebar">
        {this.renderCreateBucketModal()}
        {this.canLinkBucket() && this.renderSharedBucketsModal()}

        {this.renderBucketsButtons()}
        <SearchBar
          placeholder="Search bucket"
          query={this.state.searchQuery}
          onChange={this.handleQueryChange}
        />
        <BucketsList
          buckets={this.filteredBuckets()}
          tables={this.state.allTables}
          activeBucketId={this.state.bucketId}
        />
      </div>
    );
  },

  renderBucketsButtons() {
    return (
      <ButtonGroup justified>
        <ButtonGroup>
          <Button onClick={this.openCreateBucketModal} bsSize="sm">
            <Tooltip tooltip="Create new bucket" placement="top">
              <span><i className="fa fa-plus" /> Create</span>
            </Tooltip>
          </Button>
        </ButtonGroup>
        {this.canLinkBucket() && (
          <ButtonGroup>
            <Button onClick={this.openBucketLinkModal} bsSize="sm">
              <Tooltip tooltip="Link shared bucket to project" placement="top">
                <span><i className="fa fa-random" /> Link</span>
              </Tooltip>
            </Button>
          </ButtonGroup>
        )}
        <ButtonGroup>
          <Button
            onClick={() => {
              reloadBuckets();
              loadSharedBuckets();
            }}
            bsSize="sm"
          >
            <Tooltip tooltip="Refresh buckets" placement="top">
              <span><RefreshIcon isLoading={this.state.isReloading} title="" /> Reload</span>
            </Tooltip>
          </Button>
        </ButtonGroup>
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

  renderSharedBucketsModal() {
    return (
      <SharedBucketsModal
        sharedBuckets={this.state.sharedBuckets}
        show={this.state.linkBucketModal}
        onSubmit={this.handleCreateBucket}
        onHide={this.closeBucketLinkModal}
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

  canLinkBucket() {
    return this.state.sharedBuckets.count() > 0;
  },

  handleCreateBucket(newBucket) {
    return createBucket(newBucket);
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
  },

  openBucketLinkModal() {
    this.setState({
      linkBucketModal: true
    });
  },

  closeBucketLinkModal() {
    this.setState({
      linkBucketModal: false
    });
  }
});
