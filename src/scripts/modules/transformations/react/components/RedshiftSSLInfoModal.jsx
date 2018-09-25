import React from 'react';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';

const RedshiftSSLInfoModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Redshift SSL Connection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {'To establish a secure connection to Redshift follow AWS '}
          <a href="http://docs.aws.amazon.com/redshift/latest/mgmt/connecting-ssl-support.html">
            Configure Security Options for Connections
          </a>
          {' guide.'}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <ButtonToolbar>
          <Button onClick={onHide}>Close</Button>
        </ButtonToolbar>
      </Modal.Footer>
    </Modal>
  );
};

RedshiftSSLInfoModal.propTypes = {
  onHide: React.PropTypes.func.isRequired,
  show: React.PropTypes.bool.isRequired
};

export default RedshiftSSLInfoModal;
