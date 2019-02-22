import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Col, Row } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import TableDetail from './TableDetail';
import NavButtons from '../../components/NavButtons';

export default React.createClass({
  mixins: [PureRenderMixin, createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      bucketId: RoutesStore.getCurrentRouteParam('bucketId'),
      tableName: RoutesStore.getCurrentRouteParam('tableName')
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content reset-overflow">
          <div className="storage-explorer">
            <NavButtons />
            <Row>
              <Col sm={3}>
                <Buckets />
              </Col>
              <Col sm={9}>
                {this.state.tableName && (
                  <TableDetail key={`${this.state.bucketId}-${this.state.tableName}`} />
                )}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
});
