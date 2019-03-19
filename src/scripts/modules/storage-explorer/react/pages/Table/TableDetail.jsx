import React from 'react';
import createReactClass from 'create-react-class';
import Promise from 'bluebird';
import { Map } from 'immutable';
import { Tab, Nav, NavItem, NavDropdown, MenuItem, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import FilesStore from '../../../../components/stores/StorageFilesStore';
import MetadataStore from '../../../../components/stores/MetadataStore';
import ColumnsLocalStore from '../../../ColumnsLocalStore';
import StorageApi from '../../../../components/StorageApi';
import { factory as eventsFactory } from '../../../../sapi-events/TableEventsService';
import { createAliasTable, deleteTable, truncateTable, exportTable, uploadFile, loadTable } from '../../../Actions';

import CreateAliasTableAlternativeModal from '../../modals/CreateAliasTableAlternativeModal';
import TruncateTableModal from '../../modals/TruncateTableModal';
import DeleteTableModal from '../../modals/DeleteTableModal';
import LoadTableFromCsvModal from '../../modals/LoadTableFromCsvModal';
import ExportTableModal from '../../modals/ExportTableModal';
import DataSample from '../../components/DataSample';
import TableEvents from '../../components/Events';
import FastFade from '../../components/FastFade';
import TableOverview from './TableOverview';
import TableColumn from './TableColumn';
import SnapshotRestore from './SnapshotRestore';
import LatestImports from './LatestImports';
import TableGraph from './TableGraph';

export default createReactClass({
  mixins: [createStoreMixin(TablesStore, BucketsStore, ApplicationStore, FilesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');
    const tableName = RoutesStore.getCurrentRouteParam('tableName');
    const sapiToken = ApplicationStore.getSapiToken();
    const tables = TablesStore.getAll();
    const table = TablesStore.getAll().find(item => {
      return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
    }, null, Map());
    const buckets = BucketsStore.getAll();
    const bucket = BucketsStore.getAll().find(item => item.get('id') === bucketId);

    return {
      sapiToken,
      tables,
      table,
      buckets,
      bucket,
      canWriteTable: ['write', 'manage'].includes(sapiToken.getIn(['bucketPermissions', bucketId])),
      urlTemplates: ApplicationStore.getUrlTemplates(),
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
      creatingAliasTable: TablesStore.getIsCreatingAliasTable(),
      truncatingTable: TablesStore.getIsTruncatingTable(table.get('id')),
      deletingTable: TablesStore.getIsDeletingTable(),
      loadingIntoTable: TablesStore.getIsLoadingTable(),
      uploadingProgress: FilesStore.getUploadingProgress(bucketId) || 0,
      exportingTable: TablesStore.getIsExportingTable(table.get('id')),
      tableLinks: this.getTableLinks(table, bucket),
      tableAliases: this.getTableAliases(table, tables, sapiToken),
      machineColumnMetadata: MetadataStore.getLastUpdatedByColumnMetadata(table.get('id')) | Map(),
      userColumnMetadata: MetadataStore.getUserProvidedColumnMetadata(table.get('id')) | Map(),
      openColumns: ColumnsLocalStore.getOpenedColumns(),
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
                    <span><i className='fa fa-arrow-down' /> Export</span>
                  )}
                </MenuItem>
                <MenuItem
                  eventKey="load"
                  onSelect={this.handleDropdownAction}
                  disabled={this.state.table.get('isAlias')}
                >
                  {(this.state.loadingIntoTable || this.state.uploadingProgress > 0) ? (
                    <span>
                      <Loader /> Loading into table...
                    </span>
                  ) : (
                    <span><i className='fa fa-arrow-up' /> Load</span>
                  )}
                </MenuItem>
                {this.state.canWriteTable && <MenuItem divider />}
                {!this.state.table.get('isAlias') && this.state.canWriteTable && (
                  <MenuItem eventKey="alias" onSelect={this.handleDropdownAction}>
                    <i className="fa fa-plus" /> Create alias table
                  </MenuItem>
                )}
                {!this.state.table.get('isAlias') && this.state.canWriteTable && (
                  <MenuItem
                    eventKey="truncate"
                    onSelect={this.handleDropdownAction}
                    disabled={this.state.truncatingTable}
                  >
                    <i className="fa fa-times" /> Truncate table
                  </MenuItem>
                )}
                {this.state.canWriteTable && (
                  <MenuItem eventKey="delete" onSelect={this.handleDropdownAction} disabled={this.state.deletingTable}>
                    {this.state.deletingTable ? (
                      <span>
                        <Loader /> Deleting table...
                      </span>
                    ) : (
                      <span><i className="fa fa-trash-o" /> Delete table</span>
                    )}
                  </MenuItem>
                )}
              </NavDropdown>
            </Nav>
            <Tab.Content mountOnEnter animation={FastFade}>
              <Tab.Pane eventKey="overview">
                <TableOverview
                  table={this.state.table}
                  tables={this.state.tables}
                  tableAliases={this.state.tableAliases}
                  tableLinks={this.state.tableLinks}
                  sapiToken={this.state.sapiToken}
                  urlTemplates={this.state.urlTemplates}
                  creatingPrimaryKey={this.state.creatingPrimaryKey}
                  deletingPrimaryKey={this.state.deletingPrimaryKey}
                  settingAliasFilter={this.state.settingAliasFilter}
                  removingAliasFilter={this.state.removingAliasFilter}
                  canWriteTable={this.state.canWriteTable}
                />

                {this.state.activeTab === 'overview' && (
                  <LatestImports
                    table={this.state.table}
                    key={this.state.table.get('lastImportDate') || 'table-imports'}
                  />
                )}

                <TableColumn
                  table={this.state.table}
                  tables={this.state.tables}
                  tableAliases={this.state.tableAliases}
                  tableLinks={this.state.tableLinks}
                  sapiToken={this.state.sapiToken}
                  urlTemplates={this.state.urlTemplates}
                  creatingPrimaryKey={this.state.creatingPrimaryKey}
                  deletingPrimaryKey={this.state.deletingPrimaryKey}
                  addingColumn={this.state.addingColumn}
                  deletingColumn={this.state.deletingColumn}
                  canWriteTable={this.state.canWriteTable}
                  machineColumnMetadata={this.state.machineColumnMetadata}
                  userColumnMetadata={this.state.userColumnMetadata}
                  activeColumnId={this.state.activeColumnId}
                  openColumns={this.state.openColumns}
                  expandAllColumns={this.state.expandAllColumns}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="events">
                <Row>
                  <TableEvents
                    key={this.state.table.get('lastImportDate') || 'table-events'}
                    eventsFactory={eventsFactory(this.state.table.get('id'))}
                    excludeString={this.state.table.get('id')}
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
                  canWriteTable={this.state.canWriteTable}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="graph">
                {this.state.activeTab === 'graph' && (
                  <TableGraph
                    key={this.state.table.get('lastImportDate') || 'table-graph'}
                    table={this.state.table}
                  />
                )}
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {this.renderDeletingTableModal()}
        {this.renderLoadTableModal()}
        {this.renderExportTableModal()}
        {!this.state.table.get('isAlias') && this.state.canWriteTable && (
          <span>
            {this.renderAliasTableModal()}
            {this.renderTruncateTableModal()}
          </span>
        )}
      </div>
    );
  },

  renderAliasTableModal() {
    return (
      <CreateAliasTableAlternativeModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'alias')}
        buckets={this.state.buckets}
        table={this.state.table}
        sapiToken={this.state.sapiToken}
        onSubmit={this.handleCreateAliasTable}
        onHide={this.closeActionModal}
        isSaving={this.state.creatingAliasTable}
      />
    );
  },

  renderDeletingTableModal() {
    return (
      <DeleteTableModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'delete')}
        table={this.state.table}
        sapiToken={this.state.sapiToken}
        urlTemplates={this.state.urlTemplates}
        tableAliases={this.state.tableAliases}
        tableLinks={this.state.tableLinks}
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

  handleCreateAliasTable(bucketId, params) {
    return createAliasTable(bucketId, params);
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
      return StorageApi
        .getFilesWithRetry({
          runId: response.runId,
          'tags[]': ['storage-merged-export']
        })
        .then(files => {
          if (!files || files.length === 0) {
            return Promise.reject('Loading a file for download failed. Please try again.');
          }

          return files[0]
        });
    });
  },

  handleDropdownAction(action) {
    if (['export', 'load', 'truncate', 'delete', 'alias'].includes(action)) {
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

  getTableAliases(currentTable, tables, sapiToken) {
    const foundAliases = [];

    tables.forEach(table => {
      if (
        !table.getIn(['bucket', 'sourceBucket']) &&
        table.get('isAlias') &&
        table.getIn(['sourceTable', 'id']) === currentTable.get('id') &&
        sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])
      ) {
        foundAliases.push(table);
      }
    });

    return foundAliases;
  },

  getTableLinks(table, bucket) {
    const foundLinks = [];

    if (table.get('isAlias') || !bucket.get('linkedBy')) {
      return foundLinks;
    }

    bucket.get('linkedBy').forEach(bucket => {
      foundLinks.push(bucket.merge({ tableName: table.get('name') }));
    });

    return foundLinks;
  },

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
