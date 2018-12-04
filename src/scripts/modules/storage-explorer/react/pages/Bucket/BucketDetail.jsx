import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';

import DeleteBucketModal from '../../modals/DeleteBucketModal';
import BucketOverview from './BucketOverview';
import BucketTables from './BucketTables';
import BucketEvents from './BucketEvents';
import { deleteBucket } from '../../../Actions';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore, ApplicationStore, TablesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      sapiToken: ApplicationStore.getSapiToken(),
      tables: TablesStore.getAll().filter(table => table.getIn(['bucket', 'id']) === bucketId),
      deletingBuckets: BucketsStore.deletingBuckets().has(bucketId),
      creatingAliasTable: TablesStore.getIsCreatingAliasTable()
    };
  },

  getInitialState() {
    return {
      activeTab: 'overview',
      openDeleteBucketModal: false
    };
  },

  render() {
    if (!this.state.bucket) {
      return (
        <div className="kbc-inner-padding">
          <p>Bucket not found</p>
        </div>
      );
    }

    return (
      <div>
        <Tab.Container
          activeKey={this.state.activeTab}
          onSelect={this.handleSelectTab}
          id="bucket-detail-tabs"
          generateChildId={this.generateTabId}
        >
          <div>
            <Nav bsStyle="tabs">
              <NavItem eventKey="overview">Overview</NavItem>
              <NavItem eventKey="tables">Tables</NavItem>
              <NavItem eventKey="events">Events</NavItem>
              <NavDropdown title="Actions">
                <MenuItem eventKey="delete" onSelect={this.handleDropdownAction}>
                  Delete bucket
                </MenuItem>
              </NavDropdown>
            </Nav>
            <Tab.Content animation={false}>
              <Tab.Pane eventKey="overview">
                <BucketOverview bucket={this.state.bucket} sapiToken={this.state.sapiToken} />
              </Tab.Pane>
              <Tab.Pane eventKey="tables">
                <BucketTables
                  bucket={this.state.bucket}
                  tables={this.state.tables}
                  sapiToken={this.state.sapiToken}
                  onCreateAliasTable={this.handleCreateAliasTable}
                  isCreatingAliasTable={this.state.creatingAliasTable}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="events">
                <BucketEvents bucket={this.state.bucket} />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {this.renderDeleteBucketModal()}
      </div>
    );
  },

  renderDeleteBucketModal() {
    return (
      <DeleteBucketModal
        show={this.state.openDeleteBucketModal}
        bucket={this.state.bucket}
        tables={this.state.tables}
        deleting={this.state.deletingBuckets}
        onConfirm={this.handleDeleteBucket}
        onHide={this.closeDeleteBucketModal}
      />
    );
  },

  handleCreateAliasTable(params) {
    return StorageActionCreators.createAliasTable(this.state.bucket.get('id'), params);
  },

  handleDeleteBucket() {
    const force = this.state.tables.count() > 0;
    return deleteBucket(this.state.bucket.get('id'), force);
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'tables', 'events'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  },

  handleDropdownAction(action) {
    switch (action) {
      case 'delete':
        return this.openDeleteBucketModal();

      default:
        return null;
    }
  },

  openDeleteBucketModal() {
    this.setState({
      openDeleteBucketModal: true
    });
  },

  closeDeleteBucketModal() {
    this.setState({
      openDeleteBucketModal: false
    });
  },

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
