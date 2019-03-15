import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Col, Row } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import BucketDetail from './BucketDetail';
import NavButtons from '../../components/NavButtons';

export default createReactClass({
  mixins: [PureRenderMixin, createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      bucketId: RoutesStore.getCurrentRouteParam('bucketId')
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
                <BucketDetail key={this.state.bucketId} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
});
