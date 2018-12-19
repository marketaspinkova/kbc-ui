import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';
import DataSample from '../../components/DataSample';

import TableOverview from './TableOverview';
import TableColumn from './TableColumn';

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
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      creatingPrimaryKey: TablesStore.getIsCreatingPrimaryKey(table.get('id')),
      deletingPrimaryKey: TablesStore.getIsDeletingPrimaryKey(table.get('id')),
      addingColumn: TablesStore.getAddingColumn(),
      deletingColumn: TablesStore.getDeletingColumn()
    };
  },

  getInitialState() {
    return {
      activeTab: 'overview'
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
                <MenuItem eventKey="restore" onSelect={this.handleDropdownAction}>
                  Time Travel Restore
                </MenuItem>
                <MenuItem eventKey="snapshot" onSelect={this.handleDropdownAction}>
                  Create snapshot
                </MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="truncate" onSelect={this.handleDropdownAction}>
                  Truncate table
                </MenuItem>
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
              <Tab.Pane eventKey="snapshot-and-restore">Snapshot and Restore</Tab.Pane>
              <Tab.Pane eventKey="graph">Graph</Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    );
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'events', 'data-sample', 'snapshot-and-restore', 'graph'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  },

  handleDropdownAction(action) {
    switch (action) {
      case 'export':
      case 'load':
      case 'restore':
      case 'snapshot':
      case 'truncate':
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

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
