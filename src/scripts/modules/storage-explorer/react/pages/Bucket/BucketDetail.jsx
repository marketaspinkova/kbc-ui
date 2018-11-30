import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import BucketOverview from './BucketOverview';

export default React.createClass({
  mixins: [createStoreMixin(BucketsStore, ApplicationStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');

    return {
      bucket: BucketsStore.getAll().find(item => item.get('id') === bucketId),
      sapiToken: ApplicationStore.getSapiToken()
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
            <BucketOverview bucket={this.state.bucket} sapiToken={this.state.sapiToken} />
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
