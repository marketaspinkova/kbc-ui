import React from 'react';
import { Map } from 'immutable';
import { Tab, Nav, NavItem, NavDropdown, MenuItem, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DataSample from '../../components/DataSample';
import { deleteTable, truncateTable } from '../../../Actions';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import storageApi from '../../../../components/StorageApi';
import { exportTable, uploadFile, loadTable } from '../../../Actions';

import TruncateTableModal from '../../modals/TruncateTableModal';
import DeleteTableModal from '../../modals/DeleteTableModal';
import LoadTableFromCsvModal from '../../modals/LoadTableFromCsvModal';
import ExportTableModal from '../../modals/ExportTableModal';
import { factory as eventsFactory } from '../../../../sapi-events/TableEventsService';
import TableEvents from '../../components/Events';
import TableOverview from './TableOverview';
import TableColumn from './TableColumn';
import SnapshotRestore from './SnapshotRestore';
import LatestImports from './LatestImports';
import TableGraph from './TableGraph';

export default React.createClass({
  mixins: [createStoreMixin(TablesStore, BucketsStore, ApplicationStore, FilesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');
    const tableName = RoutesStore.getCurrentRouteParam('tableName');
    const table = TablesStore.getAll().find(item => {
      return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
    }, null, Map());

    return {
      table,
      sapiToken: ApplicationStore.getSapiToken(),
      tables: TablesStore.getAll(),
      buckets: BucketsStore.getAll(),
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      creatingPrimaryKey: TablesStore.getIsCreatingPrimaryKey(table.get('id')),
      deletingPrimaryKey: TablesStore.getIsDeletingPrimaryKey(table.get('id')),
      settingAliasFilter: TablesStore.getIsSettingAliasFilter(table.get('id')),
      removingAliasFilter: TablesStore.getIsRemovingAliasFilter(table.get('id')),
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
      uploadingProgress: FilesStore.getUploadingProgress(bucketId) || 0,
      exportingTable: TablesStore.getIsExportingTable(table.get('id'))
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
    if (!this.state.table.count()) {
      return (
        <div className="kbc-inner-padding">
          <p>Table not found</p>
        </div>
      );
    }

    const loadingIntoTable = this.state.loadingIntoTable || this.state.uploadingProgress > 0;
    const canWriteTable = this.canWriteTable();

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
                  {this.state.exportingTable ? (
                    <span>
                      <Loader /> Exporting...
                    </span>
                  ) : (
                    <span>Export</span>
                  )}
                </MenuItem>
                <MenuItem
                  eventKey="load"
                  onSelect={this.handleDropdownAction}
                  disabled={this.state.table.get('isAlias')}
                >
                  {loadingIntoTable ? (
                    <span>
                      <Loader /> Loading into table...
                    </span>
                  ) : (
                    'Load'
                  )}
                </MenuItem>
                {canWriteTable && <MenuItem divider />}
                {!this.state.table.get('isAlias') && canWriteTable && (
                  <MenuItem
                    eventKey="truncate"
                    onSelect={this.handleDropdownAction}
                    disabled={this.state.truncatingTable}
                  >
                    Truncate table
                  </MenuItem>
                )}
                {canWriteTable && (
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
                  settingAliasFilter={this.state.settingAliasFilter}
                  removingAliasFilter={this.state.removingAliasFilter}
                  canWriteTable={canWriteTable}
                />

                <LatestImports
                  table={this.state.table}
                  key={this.state.table.get('lastImportDate') || 'table-imports'}
                />

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
                  canWriteTable={canWriteTable}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="events">
                <Row>
                  <TableEvents
                    key={this.state.table.get('lastImportDate') || 'table-events'}
                    eventsFactory={eventsFactory(this.state.table.get('id'))}
                  />
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="data-sample">
                <DataSample
                  key={this.state.table.get('lastImportDate') || 'data-sample'}
                  table={this.state.table}
                />
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
                  canWriteTable={canWriteTable}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="graph">
                <TableGraph
                  key={this.state.table.get('lastImportDate') || 'table-graph'}
                  table={this.state.table}
                />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {this.renderDeletingTableModal()}
        {this.renderLoadTableModal()}
        {this.renderExportTableModal()}
        {!this.state.table.get('isAlias') && canWriteTable && this.renderTruncateTableModal()}
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

  renderExportTableModal() {
    return (
      <ExportTableModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'export')}
        table={this.state.table}
        onSubmit={this.handleExportTable}
        onHide={this.closeActionModal}
        isExporting={this.state.exportingTable}
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

    return uploadFile(bucketId, file).then(fileId => {
      return loadTable(tableId, { ...params, dataFileId: fileId });
    });
  },

  handleExportTable() {
    const tableId = this.state.table.get('id');

    return exportTable(tableId).then(response => {
      return storageApi
        .getFiles({
          runId: response.runId,
          'tags[]': ['storage-merged-export']
        })
        .then(files => files[0]);
    });
  },

  handleDropdownAction(action) {
    if (['export', 'load', 'truncate', 'delete'].includes(action)) {
      this.setState({
        openActionModal: true,
        actionModalType: action
      });
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
        !table.getIn(['bucket', 'sourceBucket']) &&
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
      foundLinks.push(bucket.merge({ tableName: this.state.table.get('name') }));
    });

    return foundLinks;
  },

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
