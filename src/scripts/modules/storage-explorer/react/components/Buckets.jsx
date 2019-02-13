import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ApplicationStore from '../../../../stores/ApplicationStore';
import BucketsStore from '../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../components/stores/StorageTablesStore';
import BucketsLocalStore from '../../BucketsLocalStore';

import matchByWords from '../../../../utils/matchByWords';
import Tooltip from '../../../../react/common/Tooltip';
import CreateBucketModal from '../modals/CreateBucketModal';
import SharedBucketsModal from '../modals/SharedBucketsModal';
import BucketsList from './BucketsList';
import { reload, createBucket } from '../../Actions';

export default React.createClass({
  mixins: [createStoreMixin(ApplicationStore, BucketsLocalStore, BucketsStore, TablesStore)],

  getStateFromStores() {
    return {
      openBuckets: BucketsLocalStore.getOpenedBuckets(),
      allBuckets: BucketsStore.getAll(),
      allTables: TablesStore.getAll(),
      sharedBuckets: BucketsStore.getSharedBuckets(),
      isReloading: BucketsLocalStore.getIsReloading(),
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
          placeholder="Search buckets or tables"
          query={this.state.searchQuery}
          onChange={this.handleQueryChange}
        />
        <BucketsList
          openBuckets={this.state.openBuckets}
          buckets={this.filteredBuckets()}
          tables={this.state.allTables}
        />
      </div>
    );
  },

  renderBucketsButtons() {
    return (
      <ButtonGroup justified>
        {this.canCreateBucket() && (
          <ButtonGroup>
            <Button onClick={this.openCreateBucketModal}>
              <Tooltip tooltip="Create new bucket" placement="top">
                <span><i className="fa fa-plus" /> Bucket</span>
              </Tooltip>
            </Button>
          </ButtonGroup>
        )}
        {this.canLinkBucket() && (
          <ButtonGroup>
            <Button onClick={this.openBucketLinkModal}>
              <Tooltip tooltip="Link shared bucket to project" placement="top">
                <span><i className="fa fa-random" /> Link</span>
              </Tooltip>
            </Button>
          </ButtonGroup>
        )}
        <ButtonGroup>
          <Button onClick={reload}>
            <Tooltip tooltip="Reload buckets &amp; tables" placement="top">
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
      const filteredTables = this.state.allTables
        .filter(table => matchByWords(table.get('name').toLowerCase(), search))
        .map(table => table.getIn(['bucket', 'id']))
        .toArray();

      buckets = buckets.filter(bucket => {
        return filteredTables.includes(bucket.get('id')) || matchByWords(bucket.get('id').toLowerCase(), search)
      });
    }

    return buckets;
  },

  canCreateBucket() {
    return this.state.sapiToken.get('canManageBuckets', false);
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
