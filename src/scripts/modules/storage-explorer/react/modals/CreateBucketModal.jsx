import React, { PropTypes } from 'react';
import { Col, Alert, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  name: '',
  stage: 'in',
  backend: '',
  error: null,
  warning: null
};

export default React.createClass({
  propTypes: {
    openModal: PropTypes.bool.isRequired,
    hasMysql: PropTypes.bool.isRequired,
    hasRedshift: PropTypes.bool.isRequired,
    hasSnowflake: PropTypes.bool.isRequired,
    defaultBackend: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
    buckets: PropTypes.object.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.openModal} onHide={this.onHide}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}
            {this.renderWarning()}

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={9}>
                <FormControl
                  autoFocus
                  type="text"
                  value={this.state.name}
                  onChange={this.handleName}
                  onBlur={this.validateBucketName}
                />
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

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Backend
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  placeholder="Select backend..."
                  onChange={this.handleBackend}
                  value={this.state.backend || this.props.defaultBackend}
                >
                  {this.renderBackendOptions()}
                </FormControl>
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.onSubmit}
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

  renderWarning() {
    if (!this.state.warning) {
      return null;
    }

    return <Alert bsStyle="warning">{this.state.warning}</Alert>;
  },

  renderBackendOptions() {
    const options = [];

    if (this.props.hasMysql) {
      options.push(
        <option key="mysql" value="mysql">
          MySQL
        </option>
      );
    }

    if (this.props.hasRedshift) {
      options.push(
        <option key="redshift" value="redshift">
          Redshift
        </option>
      );
    }

    if (this.props.hasSnowflake) {
      options.push(
        <option key="snowflake" value="snowflake">
          Snowflake
        </option>
      );
    }

    return options;
  },

  handleName(event) {
    this.validateName(event.target.value);
    this.setState({ name: event.target.value });
  },

  handleStage(event) {
    this.setState({ stage: event.target.value }, () => {
      this.validateBucketName();
    });
  },

  handleBackend(event) {
    this.setState({ backend: event.target.value });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit(event) {
    event.preventDefault();
    const newBucket = {
      name: this.state.name,
      stage: this.state.stage,
      backend: this.state.backend || this.props.defaultBackend
    };

    this.props.onSubmit(newBucket).then(this.onHide, (message) => {
      this.setState({
        error: message
      });
    });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  validateName(name) {
    if (!/^[a-zA-Z0-9_-]*$/.test(name)) {
      this.setState({
        warning: 'Only alphanumeric characters, dash and underscores are allowed in bucket name.'
      });
    } else if (this.state.warning) {
      this.setState({ warning: null });
    }
  },

  validateBucketName() {
    const bucketName = `${this.state.stage}.c-${this.state.name}`;
    const bucketWithSameName = this.props.buckets.find((bucket) => bucket.get('id') === bucketName);

    if (bucketWithSameName) {
      this.setState({
        warning: `The bucket ${this.state.name} already exists.`
      });
    } else if (this.state.warning) {
      this.setState({ warning: null });
    }
  },

  isDisabled() {
    const backend = this.state.backend || this.props.defaultBackend;

    if (!this.state.name || !this.state.stage || !backend) {
      return true;
    }

    return this.props.isSaving;
  }
});
