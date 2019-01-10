import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DataSample from '../../components/DataSample';
import TruncateTableModal from '../../modals/TruncateTableModal';
import DeleteTableModal from '../../modals/DeleteTableModal';
import LoadTableFromCsvModal from '../../modals/LoadTableFromCsvModal';
import { deleteTable, truncateTable } from '../../../Actions';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import StorageActionCreators from '../../../../components/StorageActionCreators';

import TableOverview from './TableOverview';
import TableColumn from './TableColumn';
import SnapshotRestore from './SnapshotRestore';
import TableEvents from './TableEvents';
import LatestImports from './LatestImports';
import TableGraph from './TableGraph';

export default React.createClass({
  mixins: [createStoreMixin(TablesStore, BucketsStore, ApplicationStore, FilesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');
    const tableName = RoutesStore.getCurrentRouteParam('tableName');
    const table = TablesStore.getAll().find(item => {
      return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
    });

    return {
      table,
      sapiToken: ApplicationStore.getSapiToken(),
      tables: TablesStore.getAll(),
      buckets: BucketsStore.getAll(),
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      creatingPrimaryKey: TablesStore.getIsCreatingPrimaryKey(table.get('id')),
      deletingPrimaryKey: TablesStore.getIsDeletingPrimaryKey(table.get('id')),
      addingColumn: TablesStore.getAddingColumn(),
      deletingColumn: TablesStore.getDeletingColumn(),
      creatingTable: TablesStore.getIsCreatingTable(),
      restoringTable: TablesStore.getIsRestoringTable(table.get('id')),
      creatingSnapshot: TablesStore.getIsCreatingSnapshot(table.get('id')),
      creatingFromSnapshot: TablesStore.getIsCreatingFromSnapshot(),
      deletingSnapshot: TablesStore.getIsDeletingSnapshot(),
      truncatingTable: TablesStore.getIsTruncatingTable(table.get('id')),
      deletingTable: TablesStore.getIsDeletingTable(),
      loadingIntoTable: TablesStore.getIsLoadingTable(),
      uploadingProgress: FilesStore.getUploadingProgress(bucketId) || 0
    };
  },

  getInitialState() {
    return {
      activeTab: 'overview',
      openActionModal: false,
      actionModalType: null
    };
  },

  render() {
    if (!this.state.table) {
      return (
        <div className="kbc-inner-padding">
          <p>Table not found</p>
        </div>
      );
    }

    const loadingIntoTable = this.state.loadingIntoTable || this.state.uploadingProgress > 0;

    return (
      <div>
        <Tab.Container
          activeKey={this.state.activeTab}
          onSelect={this.handleSelectTab}
          id="table-detail-tabs"
          generateChildId={this.generateTabId}
        >
          <div>
            <Nav bsStyle="tabs">
              <NavItem eventKey="overview">Overview</NavItem>
              <NavItem eventKey="events">Events</NavItem>
              <NavItem eventKey="data-sample">Data sample</NavItem>
              <NavItem eventKey="snapshot-and-restore">Snapshot and Restore</NavItem>
              <NavItem eventKey="graph">Graph</NavItem>
              <NavDropdown title="Actions">
                <MenuItem eventKey="export" onSelect={this.handleDropdownAction}>
                  Export
                </MenuItem>
                <MenuItem eventKey="load" onSelect={this.handleDropdownAction}>
                  {loadingIntoTable ? (
                    <span>
                      <Loader /> Loading into table...
                    </span>
                  ) : (
                    'Load'
                  )}
                </MenuItem>
                <MenuItem divider />
                {!this.state.table.get('isAlias') && this.canWriteTable() && (
                  <MenuItem
                    eventKey="truncate"
                    onSelect={this.handleDropdownAction}
                    disabled={this.state.truncatingTable}
                  >
                    Truncate table
                  </MenuItem>
                )}
                {this.canWriteTable() && (
                  <MenuItem eventKey="delete" onSelect={this.handleDropdownAction} disabled={this.state.deletingTable}>
                    {this.state.deletingTable ? (
                      <span>
                        <Loader /> Deleting table...
                      </span>
                    ) : (
                      'Delete table'
                    )}
                  </MenuItem>
                )}
              </NavDropdown>
            </Nav>
            <Tab.Content animation={false}>
              <Tab.Pane eventKey="overview">
                <TableOverview
                  table={this.state.table}
                  tables={this.state.tables}
                  tableAliases={this.getTableAliases()}
                  tableLinks={this.getTableLinks()}
                  sapiToken={this.state.sapiToken}
                  creatingPrimaryKey={this.state.creatingPrimaryKey}
                  deletingPrimaryKey={this.state.deletingPrimaryKey}
                />

                <LatestImports table={this.state.table} />

                <TableColumn
                  table={this.state.table}
                  tables={this.state.tables}
                  tableAliases={this.getTableAliases()}
                  tableLinks={this.getTableLinks()}
                  sapiToken={this.state.sapiToken}
                  creatingPrimaryKey={this.state.creatingPrimaryKey}
                  deletingPrimaryKey={this.state.deletingPrimaryKey}
                  addingColumn={this.state.addingColumn}
                  deletingColumn={this.state.deletingColumn}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="events">
                <TableEvents table={this.state.table} />
              </Tab.Pane>
              <Tab.Pane eventKey="data-sample">
                <DataSample table={this.state.table} />
              </Tab.Pane>
              <Tab.Pane eventKey="snapshot-and-restore">
                <SnapshotRestore
                  table={this.state.table}
                  buckets={this.state.buckets}
                  sapiToken={this.state.sapiToken}
                  restoringTable={this.state.restoringTable}
                  creatingSnapshot={this.state.creatingSnapshot}
                  creatingFromSnapshot={this.state.creatingFromSnapshot}
                  deletingSnapshot={this.state.deletingSnapshot}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="graph">
                <TableGraph table={this.state.table} />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {this.renderDeletingTableModal()}
        {this.renderLoadTableModal()}
        {!this.state.table.get('isAlias') && this.canWriteTable() && this.renderTruncateTableModal()}
      </div>
    );
  },

  renderDeletingTableModal() {
    return (
      <DeleteTableModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'delete')}
        table={this.state.table}
        sapiToken={this.state.sapiToken}
        tableAliases={this.getTableAliases()}
        tableLinks={this.getTableLinks()}
        deleting={this.state.deletingTable}
        onConfirm={this.handleDeleteTable}
        onHide={this.closeActionModal}
      />
    );
  },

  renderTruncateTableModal() {
    return (
      <TruncateTableModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'truncate')}
        onConfirm={this.handleTruncateTable}
        onHide={this.closeActionModal}
        tableId={this.state.table.get('id')}
      />
    );
  },

  renderLoadTableModal() {
    return (
      <LoadTableFromCsvModal
        show={this.state.actionModalType === 'load'}
        table={this.state.table}
        onSubmit={this.handleLoadTable}
        onHide={this.closeActionModal}
        isLoading={this.state.loadingIntoTable}
        progress={this.state.uploadingProgress}
      />
    );
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'events', 'data-sample', 'snapshot-and-restore', 'graph'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  },

  handleDeleteTable(forceDelete) {
    const bucketId = this.state.bucket.get('id');
    const tableId = this.state.table.get('id');

    return deleteTable(bucketId, tableId, forceDelete);
  },

  handleTruncateTable() {
    const tableId = this.state.table.get('id');

    return truncateTable(tableId);
  },

  handleLoadTable(file, params) {
    const bucketId = this.state.bucket.get('id');
    const tableId = this.state.table.get('id');

    return StorageActionCreators.uploadFile(bucketId, file).then(fileId => {
      return StorageActionCreators.loadTable(tableId, {
        ...params,
        dataFileId: fileId
      });
    });
  },

  handleDropdownAction(action) {
    switch (action) {
      case 'export':
        return null;

      case 'load':
        return this.setState({
          openActionModal: true,
          actionModalType: 'load'
        });

      case 'truncate':
        return this.setState({
          openActionModal: true,
          actionModalType: 'truncate'
        });

      case 'delete':
        return this.setState({
          openActionModal: true,
          actionModalType: 'delete'
        });

      default:
        return null;
    }
  },

  closeActionModal() {
    this.setState({
      openActionModal: false,
      actionModalType: null
    });
  },

  canWriteTable() {
    const bucketId = this.state.table.getIn(['bucket', 'id']);
    const permission = this.state.sapiToken.getIn(['bucketPermissions', bucketId]);
    return ['write', 'manage'].includes(permission);
  },

  getTableAliases() {
    const foundAliases = [];

    this.state.tables.forEach(table => {
      if (
        table.get('sourceTable') &&
        table.get('isAlias') &&
        table.getIn(['sourceTable', 'id']) === this.state.table.get('id') &&
        this.state.sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])
      ) {
        foundAliases.push(table);
      }
    });

    return foundAliases;
  },

  getTableLinks() {
    const foundLinks = [];

    if (this.state.table.get('isAlias') || !this.state.bucket.get('linkedBy')) {
      return foundLinks;
    }

    this.state.bucket.get('linkedBy').forEach(bucket => {
      foundLinks.push(
        bucket.merge({
          id: `${bucket.get('id')}.${this.state.table.get('name')}`,
          bucketId: bucket.get('id'),
          tableName: this.state.table.get('name')
        })
      );
    });

    return foundLinks;
  },

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
