import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Alert, Modal, Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  bucket: '',
  name: '',
  stage: 'in',
  error: null
};

export default createReactClass({
  propTypes: {
    sharedBuckets: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Link bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Shared buckets
              </Col>
              <Col sm={9}>
                <Select
                  autoFocus
                  disabled={false}
                  placeholder="Select bucket..."
                  value={this.state.bucket}
                  onChange={this.handleBucket}
                  options={this.bucketsOptions()}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={9}>
                <FormControl type="text" value={this.state.name} onChange={this.handleName} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Stage
              </Col>
              <Col sm={9}>
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
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Link"
              onCancel={this.onHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  bucketsOptions() {
    return this.props.sharedBuckets
      .map((bucket) => ({
        value: JSON.stringify(bucket.toJSON()),
        label: `${bucket.getIn(['project', 'name'])} / ${bucket.get('id')}`
      }))
      .sortBy((option) => option.label.toLowerCase())
      .toArray();
  },

  handleSubmit(event) {
    event.preventDefault();
    const sharedBucket = JSON.parse(this.state.bucket);
    const newBucket = {
      name: this.state.name,
      stage: this.state.stage,
      sourceProjectId: sharedBucket.project.id,
      sourceBucketId: sharedBucket.id
    };

    this.props.onSubmit(newBucket).then(this.onHide, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  },

  handleBucket(selected) {
    this.setState({ bucket: selected ? selected.value : null });
  },

  handleName(event) {
    this.setState({ name: event.target.value });
  },

  handleStage(event) {
    this.setState({ stage: event.target.value });
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return !this.state.bucket || !this.state.name || !this.state.stage;
  }
});
