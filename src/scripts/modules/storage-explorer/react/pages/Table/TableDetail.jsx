import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';

export default React.createClass({
  mixins: [createStoreMixin(TablesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');
    const tableName = RoutesStore.getCurrentRouteParam('tableName');

    return {
      table: TablesStore.getAll().find(item => {
        return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
      })
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
        <div className="kbc-inner-padding">
          <h2>Table {this.state.table.get('name')}</h2>
        </div>

        <Tab.Container
          activeKey={this.state.activeTab}
          onSelect={this.handleSelectTab}
          id="bucket-tabs"
          generateChildId={this.generateTabId}
        >
          <div>
            <Nav bsStyle="tabs">
              <NavItem eventKey="overview">Overview</NavItem>
              <NavItem eventKey="description">Description</NavItem>
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
              <Tab.Pane eventKey="overview">Overview</Tab.Pane>
              <Tab.Pane eventKey="description">Description</Tab.Pane>
              <Tab.Pane eventKey="events">Events</Tab.Pane>
              <Tab.Pane eventKey="data-sample">Data sample</Tab.Pane>
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

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
