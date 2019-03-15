import React from 'react';
import createReactClass from 'create-react-class';
import { Col, Row } from 'react-bootstrap';
import Buckets from '../../components/Buckets';
import Events from '../../components/Events';
import NavButtons from '../../components/NavButtons';

export default createReactClass({
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
                <Events />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
});
