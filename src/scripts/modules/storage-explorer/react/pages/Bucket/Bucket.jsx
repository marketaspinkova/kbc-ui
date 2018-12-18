import React from 'react';
import { Col } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketDetail from './BucketDetail';

export default React.createClass({
  mixins: [createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      bucketId: RoutesStore.getCurrentRouteParam('bucketId')
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <Col sm={3}>
          <Buckets />
        </Col>
        <Col sm={9} className="kbc-main-content">
          <BucketDetail key={this.state.bucketId} />
        </Col>
      </div>
    );
  }
});
