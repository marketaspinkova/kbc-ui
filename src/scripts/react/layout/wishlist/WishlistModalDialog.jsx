import React, { PropTypes } from 'react';
import { Col, ControlLabel, Modal, Form, FormGroup, FormControl } from 'react-bootstrap';
import ConfirmButtons from '../../common/ConfirmButtons';

const INITIAL_STATE = {
  title: '',
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
            <Modal.Title>Wishlist request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                  autoFocus
                  type="text"
                  value={this.state.title}
                  onChange={this.handleTitle}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="textarea"
                  rows="6"
                  value={this.state.description}
                  onChange={this.handleDescription}
                />
              </Col>
            </FormGroup>
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

  handleTitle(event) {
    this.setState({ title: event.target.value });
  },

  handleDescription(event) {
    this.setState({ description: event.target.value });
  },

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.title, this.state.description).then(this.onHide);
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return !this.state.title || !this.state.description;
  }
});
