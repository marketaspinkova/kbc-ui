import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {ButtonToolbar, Button, Modal} from 'react-bootstrap';
import contactSupport from '../../../../../utils/contactSupport';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool,
    onHideFn: PropTypes.func
  },

  render() {
    return (
      <div className="static-modal">
        <Modal
          show={this.props.show}
          onHide={this.props.onHideFn}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Redshift Backend Not Enabled
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Redshift is not enabled for this project, please
            <a onClick={this.openSupportModal}> contact us </a>
            to get more info.
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="link"
                onClick={this.props.onHideFn}>Close
              </Button>
            </ButtonToolbar>
          </Modal.Footer>

        </Modal>
      </div>
    );
  },

  openSupportModal(e) {
    e.preventDefault();
    e.stopPropagation();
    contactSupport();
  }
});
