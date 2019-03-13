import PropTypes from 'prop-types';
import React from 'react';
import { Loader } from '@keboola/indigo-ui';
import {
  Form,
  Modal,
  ButtonToolbar,
  Button,
  SplitButton,
  FormGroup,
  FormControl,
  MenuItem
} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    isSaving: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    changeDescription: PropTypes.string
  },

  getInitialState() {
    return {
      openModal: false
    };
  },

  render() {
    return (
      <span className="kbc-buttons kbc-save-buttons">
        {this.renderResetButton()}
        {this.renderSaveButton()}
        {this.renderModal()}
      </span>
    );
  },

  renderSaveButton() {
    return (
      <SplitButton
        id="queries-save-button"
        className="save-button"
        bsStyle="success"
        disabled={this.saveButtonDisabled()}
        title={this.saveButtonText()}
        onClick={this.props.onSave}
        pullRight
      >
        <MenuItem onSelect={this.openModal}>Save with description</MenuItem>
      </SplitButton>
    );
  },

  renderResetButton() {
    if (!this.props.isChanged || this.props.isSaving) {
      return null;
    }

    return (
      <Button bsStyle="link" onClick={this.props.onReset}>
        Reset
      </Button>
    );
  },

  renderModal() {
    return (
      <Modal show={this.state.openModal} onHide={this.closeModal}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Set description of the change you made</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <FormControl
                componentClass="textarea"
                rows={4}
                autoFocus
                value={this.props.changeDescription}
                onChange={e => this.props.onDescriptionChange(e.target.value)}
                disabled={this.props.isSaving}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button bsStyle="link" onClick={this.closeModal}>
                Close
              </Button>
              <Button bsStyle="success" type="submit" onClick={this.handleSubmit}>
                Save
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  saveButtonText() {
    if (this.props.isSaving) {
      return <Loader />;
    }

    return this.props.isChanged ? 'Save' : 'Saved';
  },

  saveButtonDisabled() {
    return this.props.disabled || this.props.isSaving || !this.props.isChanged;
  },

  handleSubmit(e) {
    e.preventDefault();
    this.closeModal();
    this.props.onSave();
  },

  openModal() {
    this.setState({
      openModal: true
    });
  },

  closeModal() {
    this.setState({
      openModal: false
    });
  }
});
