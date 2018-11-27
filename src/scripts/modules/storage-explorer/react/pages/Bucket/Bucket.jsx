import React from 'react';
import { Col } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import BucketDetail from './BucketDetail';

export default React.createClass({
  render() {
    return (
      <div className="container-fluid">
        <Col sm={3}>
          <Buckets />
        </Col>
        <Col sm={9} className="kbc-main-content">
          <BucketDetail />
        </Col>
      </div>
    );
  }
});
