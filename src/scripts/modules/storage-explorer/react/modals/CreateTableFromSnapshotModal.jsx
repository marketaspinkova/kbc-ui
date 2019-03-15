import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Col, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  bucketId: '',
  name: ''
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    snapshot: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    tableName: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      ...INITIAL_STATE,
      name: this.props.tableName
    };
  },

  render() {
    const bucketsOptions = this.props.buckets
      .map(bucket => {
        return { label: bucket.get('id'), value: bucket.get('id') };
      })
      .toArray();

    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create table from snapshot {this.props.snapshot.get('id')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Destination Bucket
              </Col>
              <Col sm={8}>
                <Select
                  autoFocus
                  clearable={false}
                  backspaceRemoves={false}
                  deleteRemoves={false}
                  value={this.state.bucketId}
                  onChange={this.handleDestinationBucket}
                  options={bucketsOptions}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Table Name
              </Col>
              <Col sm={8}>
                <FormControl type="text" value={this.state.name} onChange={this.handleName} />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={this.isDisabled()}
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

  handleDestinationBucket(selected) {
    this.setState({
      bucketId: selected.value
    });
  },

  handleName(event) {
    this.setState({
      name: event.target.value
    });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.bucketId, this.state.name);
    this.onHide();
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return !this.state.bucketId || !this.state.name;
  }
});
