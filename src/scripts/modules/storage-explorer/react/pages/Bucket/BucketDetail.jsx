import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId)
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

        <Tabs
          activeKey={this.state.activeTab}
          onSelect={this.handleSelectTab}
          animation={false}
          id="bucket-detail-tabs"
        >
          <Tab eventKey="overview" title="Overview">
            Overview
          </Tab>
          <Tab eventKey="description" title="Description">
            Description
          </Tab>
          <Tab eventKey="tables" title="Tables">
            Tables
          </Tab>
          <Tab eventKey="events" title="Events">
            Events
          </Tab>
        </Tabs>
      </div>
    );
  },

  handleSelectTab(tab) {
    if (['overview', 'description', 'tables', 'events'].includes(tab)) {
      this.setState({
        activeTab: tab
      });
    }
  }
});
