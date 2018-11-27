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

        <Tabs defaultActiveKey={1} animation={false} id="bucket-detail-tabs">
          <Tab eventKey={1} title="Overview">
            Overview
          </Tab>
          <Tab eventKey={2} title="Description">
            Description
          </Tab>
          <Tab eventKey={3} title="Tables">
            Tables
          </Tab>
          <Tab eventKey={4} title="Events">
            Events
          </Tab>
        </Tabs>
      </div>
    );
  }
});
