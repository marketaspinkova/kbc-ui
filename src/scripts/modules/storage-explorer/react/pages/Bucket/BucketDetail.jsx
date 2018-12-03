import React from 'react';
import { Tab, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';

import BucketOverview from './BucketOverview';
import BucketTables from './BucketTables';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore, ApplicationStore, TablesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      sapiToken: ApplicationStore.getSapiToken(),
      tables: TablesStore.getAll().filter(table => table.getIn(['bucket', 'id']) === bucketId)
    };
  },

  getInitialState() {
    return {
      activeTab: 'overview'
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
        <div className="kbc-inner-padding">
          <h2>Bucket {this.state.bucket.get('id')}</h2>
        </div>

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
                <BucketTables bucket={this.state.bucket} tables={this.state.tables} />
              </Tab.Pane>
              <Tab.Pane eventKey="events">Events</Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    );
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'tables', 'events'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  },

  handleDropdownAction() {},

  generateTabId(eventKey, type) {
    return `${eventKey}-${type}`;
  }
});
