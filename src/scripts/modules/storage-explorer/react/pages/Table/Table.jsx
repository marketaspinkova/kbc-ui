import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import TableDetail from './TableDetail';
import NavButtons from '../../components/NavButtons';

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
        <div className="kbc-main-content">
          <NavButtons />

          <Col sm={3}>
            <Buckets />
          </Col>
          <Col sm={9}>
            {this.state.tableName && (
              <Row>
                <TableDetail key={`${this.state.bucketId}-${this.state.tableName}`} />
              </Row>
            )}
          </Col>
        </div>
      </div>
    );
  }
});
