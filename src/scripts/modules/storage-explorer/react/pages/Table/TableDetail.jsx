import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
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

  render() {
    if (!this.state.table) {
      return (
        <div className="kbc-inner-padding">
          <p>Table not found</p>
        </div>
      );
    }

    return (
      <div className="kbc-inner-padding">
        <h2>Table {this.state.table.get('name')}</h2>

        <Tabs defaultActiveKey={1} animation={false} id="bucket-detail-tabs">
          <Tab eventKey={1} title="Overview">
            Overview
          </Tab>
          <Tab eventKey={2} title="Description">
            Description
          </Tab>
          <Tab eventKey={3} title="Events">
            Events
          </Tab>
          <Tab eventKey={3} title="Data sample">
            Data sample
          </Tab>
          <Tab eventKey={3} title="Snapshot and Restore">
            Snapshot and Restore
          </Tab>
          <Tab eventKey={3} title="Graph">
            Graph
          </Tab>
          <Tab eventKey={3} title="Actions">
            Actions
          </Tab>
        </Tabs>
      </div>
    );
  }
});
