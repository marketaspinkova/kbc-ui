import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';

import DeleteBucketModal from '../../modals/DeleteBucketModal';
import BucketOverview from './BucketOverview';
import BucketTables from './BucketTables';
import BucketEvents from './BucketEvents';
import { deleteBucket, createTableFromTextInput } from '../../../Actions';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore, ApplicationStore, TablesStore, FilesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      sapiToken: ApplicationStore.getSapiToken(),
      tables: TablesStore.getAll().filter(table => table.getIn(['bucket', 'id']) === bucketId),
      deletingBuckets: BucketsStore.deletingBuckets().has(bucketId),
      isSharing: BucketsStore.isSharing(bucketId),
      isUnsharing: BucketsStore.isUnsharing(bucketId),
      creatingTable: TablesStore.getIsCreatingTable(),
      creatingAliasTable: TablesStore.getIsCreatingAliasTable(),
      uploadingProgress: FilesStore.getUploadingProgress(bucketId) || 0
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
                <BucketOverview
                  bucket={this.state.bucket}
                  sapiToken={this.state.sapiToken}
                  isSharing={this.state.isSharing}
                  isUnsharing={this.state.isUnsharing}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="tables">
                <BucketTables
                  bucket={this.state.bucket}
                  tables={this.state.tables}
                  sapiToken={this.state.sapiToken}
                  onCreateTableFromCsv={this.handleCreateTableFromCsv}
                  onCreateTableFromString={this.handleCreateTableFromString}
                  onCreateAliasTable={this.handleCreateAliasTable}
                  isCreatingTable={this.state.creatingTable}
                  isCreatingAliasTable={this.state.creatingAliasTable}
                  uploadingProgress={this.state.uploadingProgress}
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

  handleCreateTableFromCsv(file, params) {
    const bucketId = this.state.bucket.get('id');
    return StorageActionCreators.uploadFile(bucketId, file).then(fileId => {
      return StorageActionCreators.createTable(bucketId, {
        ...params,
        dataFileId: fileId
      });
    });
  },

  handleCreateTableFromString(params) {
    const bucketId = this.state.bucket.get('id');
    return createTableFromTextInput(bucketId, params);
  },

  handleCreateAliasTable(params) {
    const bucketId = this.state.bucket.get('id');
    return StorageActionCreators.createAliasTable(bucketId, params);
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
