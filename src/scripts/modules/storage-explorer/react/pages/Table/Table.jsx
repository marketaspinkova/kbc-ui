import React from 'react';
import { Col } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import TableDetail from './TableDetail';

export default React.createClass({
  mixins: [createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      bucketId: RoutesStore.getCurrentRouteParam('bucketId'),
      tableName: RoutesStore.getCurrentRouteParam('tableName')
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <Col sm={3}>
          <Buckets />
        </Col>
        <Col sm={9} className="kbc-main-content">
          <TableDetail key={`${this.state.bucketId}-${this.state.tableName}`} />
        </Col>
      </div>
    );
  }
});
