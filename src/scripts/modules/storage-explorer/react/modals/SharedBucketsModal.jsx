import React, { PropTypes } from 'react';
import { Alert, Modal, Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  bucket: '',
  name: '',
  stage: 'in',
  error: null
};

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Link bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Shared buckets
              </Col>
              <Col sm={8}>
                <FormControl
                  componentClass="select"
                  placeholder="Select bucket..."
                  onChange={this.handleBucket}
                  value={this.state.bucket}
                >
                  {this.renderBucketsGrouped()}
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={8}>
                <FormControl type="text" autoFocus value={this.state.name} onChange={this.handleName} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Stage
              </Col>
              <Col sm={8}>
                <FormControl
                  componentClass="select"
                  placeholder="Select stage..."
                  onChange={this.handleStage}
                  value={this.state.stage}
                >
                  <option value="in">in</option>
                  <option value="out">out</option>
                </FormControl>
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={this.isDisabled()}
              saveLabel="Link"
              onCancel={this.propsonHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderBucketsGrouped() {
    return [];
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  handleSubmit() {
    event.preventDefault();

    const newBucket = {
      name: this.state.name,
      stage: this.state.stage,
      sourceProjectId: '',
      sourceBucketId: ''
    };

    this.props.onSubmit(newBucket).then(this.onHide, message => {
      this.setState({
        error: message
      });
    });
  },

  handleBucket(event) {
    this.setState({
      bucket: event.target.value
    });
  },

  handleName(event) {
    this.setState({
      name: event.target.value
    });
  },

  handleStage(event) {
    this.setState({
      stage: event.target.value
    });
  },

  isDisabled() {
    return !this.state.bucket || !this.state.name || !this.state.stage;
  }
});
