import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Col, Alert, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  description: ''
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create snapshot</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert>
              Table settings, attributes and content will be saved in its current state. Any time later, you can create
              a perfect copy of the table elsewhere.
            </Alert>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  value={this.state.description}
                  onChange={this.handleDescription}
                  autoFocus
                />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={false}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleDescription(event) {
    this.setState({
      description: event.target.value
    });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.description);
    this.onHide();
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  }
});
