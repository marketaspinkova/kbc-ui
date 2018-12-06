import React, { PropTypes } from 'react';
import { Modal, Col, Alert, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      description: ''
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={true}>
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
                <FormControl type="text" value={this.state.description} onChange={this.handleDescription} />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={false}
              saveLabel="Create"
              onCancel={this.props.onHide}
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
    this.props.onHide();
  }
});
