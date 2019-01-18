import React, { PropTypes } from 'react';
import { Alert, Modal, Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  bucket: null,
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
                  value={JSON.stringify(this.state.bucket)}
                >
                  {this.groupedBuckets()
                    .map((group, groupName) => {
                      return (
                        <optgroup key={groupName} label={groupName}>
                          {group
                            .map((bucket, index) => {
                              return (
                                <option key={index} value={JSON.stringify(bucket.toJS())}>
                                  {this.bucketLabel(bucket)}
                                </option>
                              );
                            })
                            .toArray()}
                        </optgroup>
                      );
                    })
                    .toArray()}
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
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Link"
              onCancel={this.props.onHide}
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
    return this.props.sharedBuckets.groupBy(bucket => {
      return bucket.getIn(['project', 'name']);
    });
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

    const newBucket = {
      name: this.state.name,
      stage: this.state.stage,
      sourceProjectId: this.state.bucket.project.id,
      sourceBucketId: this.state.bucket.id
    };

    this.props.onSubmit(newBucket).then(this.onHide, message => {
      this.setState({
        error: message
      });
    });
  },

  handleBucket(event) {
    this.setState({
      bucket: JSON.parse(event.target.value)
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
