import React from 'react';
import { Map } from 'immutable';
import { Tab, Nav, NavItem, NavDropdown, MenuItem, Row } from 'react-bootstrap';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import { factory as eventsFactory } from '../../../../sapi-events/BucketEventsService';
import { createTable, deleteBucket, createAliasTable, createTableFromTextInput, uploadFile } from '../../../Actions';

import Tooltip from '../../../../../react/common/Tooltip';
import FastFade from '../../components/FastFade';
import BucketEvents from '../../components/Events';
import DeleteBucketModal from '../../modals/DeleteBucketModal';
import BucketOverview from './BucketOverview';
import BucketTables from './BucketTables';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore, ApplicationStore, TablesStore, FilesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      sapiToken: ApplicationStore.getSapiToken(),
      urlTemplates: ApplicationStore.getUrlTemplates(),
      tables: TablesStore.getAll().filter(table => table.getIn(['bucket', 'id']) === bucketId),
      deletingBuckets: BucketsStore.deletingBuckets().has(bucketId),
      isSharing: BucketsStore.isSharing(bucketId),
      isUnsharing: BucketsStore.isUnsharing(bucketId),
      isChangingSharingType: BucketsStore.isChangingSharingType(bucketId),
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

    const linkedBuckets = this.state.bucket.get('linkedBy', Map());

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
              <NavItem eventKey="events">Events</NavItem>
              <NavDropdown title="Actions">
                <MenuItem
                  eventKey="delete"
                  onSelect={this.openDeleteBucketModal}
                  disabled={!this.canManageBucket() || linkedBuckets.count() > 0}
                >
                  {linkedBuckets.count() > 0 ? (
                    <Tooltip tooltip="Please unlink linked buckets first" placement="top">
                      <span>Delete bucket</span>
                    </Tooltip>
                  ) : 'Delete bucket'}
                </MenuItem>
              </NavDropdown>
            </Nav>
            <Tab.Content mountOnEnter animation={FastFade}>
              <Tab.Pane eventKey="overview">
                <BucketOverview
                  bucket={this.state.bucket}
                  sapiToken={this.state.sapiToken}
                  urlTemplates={this.state.urlTemplates}
                  isSharing={this.state.isSharing}
                  isUnsharing={this.state.isUnsharing}
                  isChangingSharingType={this.state.isChangingSharingType}
                />

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
                <Row>
                  <BucketEvents 
                    eventsFactory={eventsFactory(this.state.bucket.get('id'))} 
                    excludeString={`${this.state.bucket.get('id')}.`}  
                  />
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {this.canManageBucket() && this.renderDeleteBucketModal()}
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
    return uploadFile(bucketId, file).then(fileId => {
      return createTable(bucketId, { ...params, dataFileId: fileId });
    });
  },

  handleCreateTableFromString(params) {
    const bucketId = this.state.bucket.get('id');
    return createTableFromTextInput(bucketId, params);
  },

  handleCreateAliasTable(params) {
    const bucketId = this.state.bucket.get('id');
    return createAliasTable(bucketId, params);
  },

  handleDeleteBucket() {
    const force = this.state.tables.count() > 0;
    return deleteBucket(this.state.bucket.get('id'), force);
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'events'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  },

  canManageBucket() {
    const bucketId = this.state.bucket.get('id');
    const permission = this.state.sapiToken.getIn(['bucketPermissions', bucketId], '');
    return permission === 'manage';
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
