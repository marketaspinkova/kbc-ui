import React, { PropTypes } from 'react';
import { Modal, Form, FormControl } from 'react-bootstrap';
import ConfirmButtons from '../../common/ConfirmButtons';

const INITIAL_STATE = {
  description: ''
};

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Submit new idea</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormControl
              componentClass="textarea"
              autoFocus
              rows="6"
              value={this.state.description}
              onChange={this.handleDescription}
              placeholder="What would you like to be able to do? How would that help you?"
            />
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveLabel="Send"
              saveButtonType="submit"
              isDisabled={this.isDisabled()}
              isSaving={this.props.isSaving}
              onCancel={this.onHide}
              onSave={this.onSubmit}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleDescription(event) {
    this.setState({ description: event.target.value });
  },

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.description).then(this.onHide);
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return !this.state.description;
  }
});
