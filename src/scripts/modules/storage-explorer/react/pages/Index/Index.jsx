import React from 'react';
import { Col } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import Events from '../../components/Events';
import NavButtons from '../../components/NavButtons';

export default React.createClass({
  render() {
    return (
      <div className="container-fluid kbc-main-content">
        <NavButtons />

        <Col sm={3}>
          <Buckets />
        </Col>
        <Col sm={9}>
          <Events />
        </Col>
      </div>
    );
  }
});
