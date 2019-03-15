import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../react/common/ConfirmButtons';
import CredentialsForm from './CredentialsForm';

export default createReactClass({
  propTypes: {
    credentials: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
    show: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CredentialsForm
            credentials={this.props.credentials}
            onChange={this.props.onChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            isDisabled={this.props.isSaving || !this.isValid()}
            onSave={this.handleSave}
            onCancel={this.props.onHide}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    return this.props.credentials.get('username').trim().length > 0 &&
      this.props.credentials.get('#password').trim().length > 0;
  },

  handleSave() {
    this.props.onSave().then(() => this.props.onHide());
  }

});
