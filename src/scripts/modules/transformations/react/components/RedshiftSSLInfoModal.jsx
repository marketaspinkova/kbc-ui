import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

const RedshiftSSLInfoModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Redshift SSL Connection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {'To establish a secure connection to Redshift follow AWS '}
          <ExternalLink href="http://docs.aws.amazon.com/redshift/latest/mgmt/connecting-ssl-support.html">
            Configure Security Options for Connections
          </ExternalLink>
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
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};

export default RedshiftSSLInfoModal;
