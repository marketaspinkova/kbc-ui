import React, { PropTypes } from 'react';
import { Alert, Modal, Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  bucket: '',
  name: '',
  stage: 'in',
  error: null
};

export default React.createClass({
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
      <Modal show={this.props.show} onHide={this.onHide}>
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
                <Select
                  disabled={false}
                  placeholder="Select bucket..."
                  value={this.state.bucket}
                  onChange={this.handleBucket}
                  options={this.groupedBuckets()}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={8}>
                <FormControl type="text" value={this.state.name} onChange={this.handleName} />
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

  groupedBuckets() {
    return this.props.sharedBuckets
      .map((bucket) => ({
        value: bucket.get('id'),
        label: `${bucket.getIn(['project', 'name'])} - ${bucket.get('name')}`
      }))
      .sortBy((option) => option.label.toLowerCase())
      .toArray();
  },

  bucketLabel(bucket) {
    let label = bucket.get('id');

    if (bucket.get('description')) {
      label += ` - ${bucket.get('description')}`;
    }

    return label;
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

  handleBucket(bucket) {
    this.setState({ bucket });
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

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return !this.state.bucket || !this.state.name || !this.state.stage;
  }
});
