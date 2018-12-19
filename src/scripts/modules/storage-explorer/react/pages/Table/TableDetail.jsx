import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DataSample from '../../components/DataSample';
import { truncateTable } from '../../../Actions';

import TableOverview from './TableOverview';
import TableColumn from './TableColumn';
import SnapshotRestore from './SnapshotRestore';

export default React.createClass({
  mixins: [createStoreMixin(TablesStore, BucketsStore, ApplicationStore)],

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
      truncatingTable: TablesStore.getIsTruncatingTable(table.get('id'))
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
                  Load
                </MenuItem>
                <MenuItem divider />
                {!this.state.table.get('isAlias') && this.canWriteTable() && (
                  <MenuItem
                    eventKey="truncate"
                    onSelect={this.handleDropdownAction}
                    disabled={this.state.truncatingTable}
                  >
                    {this.state.truncatingTable ? (
                      <span>
                        <Loader /> Truncating table...
                      </span>
                    ) : (
                      'Truncate table'
                    )}
                  </MenuItem>
                )}
                <MenuItem eventKey="delete" onSelect={this.handleDropdownAction}>
                  Delete table
                </MenuItem>
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
              <Tab.Pane eventKey="events">Events</Tab.Pane>
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
              <Tab.Pane eventKey="graph">Graph</Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>

        {!this.state.table.get('isAlias') && this.canWriteTable() && this.renderTruncateTableModal()}
      </div>
    );
  },

  renderTruncateTableModal() {
    return (
      <ConfirmModal
        show={!!(this.state.openActionModal && this.state.actionModalType === 'truncate')}
        title="Truncate table"
        buttonType="danger"
        buttonLabel="Delete"
        text={
          <p>
            Do you really want to truncate table <strong>{this.state.table.get('id')}</strong>?
          </p>
        }
        onConfirm={this.handleTruncateTable}
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

  handleTruncateTable() {
    const tableId = this.state.table.get('id');

    return truncateTable(tableId);
  },

  handleDropdownAction(action) {
    switch (action) {
      case 'export':
      case 'load':
        return null;

      case 'truncate':
        return this.setState({
          openActionModal: true,
          actionModalType: 'truncate'
        });

      case 'delete':
        return null;

      default:
        return null;
    }
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

  openActionModal(type) {
    this.setState({
      openActionModal: true,
      actionModalType: type
    });
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

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
