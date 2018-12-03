import React, { PropTypes } from 'react';
import { Col, Alert, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    openModal: PropTypes.bool.isRequired,
    hasRedshift: PropTypes.bool.isRequired,
    hasSnowflake: PropTypes.bool.isRequired,
    defaultBackend: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      name: '',
      stage: 'in',
      backend: '',
      error: null
    };
  },

  render() {
    return (
      <Modal show={this.props.openModal} onHide={this.onHide} enforceFocus={false}>
        <Form horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}
            {this.renderCheckRedshift()}
            {this.renderCheckSnowflake()}

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={8}>
                <FormControl type="text" name="name" value={this.state.name} onChange={this.handleName} />
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
                  <option value="sys">sys</option>
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Stage
              </Col>
              <Col sm={8}>
                <FormControl
                  componentClass="select"
                  placeholder="Select backend..."
                  onChange={this.handleBackend}
                  value={this.state.backend || this.props.defaultBackend}
                >
                  <option value="mysql">MySQL</option>
                  <option value="redshift">Redshift</option>
                  <option value="snowflake">Snowflake</option>
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

  renderCheckRedshift() {
    if (this.state.backend === 'redshift' && !this.props.hasRedshift) {
      return (
        <Alert bsStyle="warning">
          Redshift is not enabled for this project. Please contact{' '}
          <a href="mailto:support@keboola.com">support@keboola.com</a>.
        </Alert>
      );
    }
  },

  renderCheckSnowflake() {
    if (this.state.backend === 'snowflake' && !this.props.hasSnowflake) {
      return (
        <Alert bsStyle="warning">
          Snowflake is not enabled for this project. Please contact{' '}
          <a href="mailto:support@keboola.com">support@keboola.com</a>.
        </Alert>
      );
    }
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return (
      <div className="alert alert-danger">
        {this.state.error}
      </div>
    );
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

  handleBackend(event) {
    this.setState({
      backend: event.target.value
    });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit() {
    const newBucket = {
      name: this.state.name,
      stage: this.state.stage,
      backend: this.state.backend || this.props.defaultBackend
    };

    this.props.onSubmit(newBucket)
      .then(() => {
        this.onHide();
      }, (message) => {
        this.setState({
          error: message
        });
      });
  },

  resetState() {
    this.setState({
      name: '',
      stage: 'in',
      backend: '',
      error: null
    });
  },

  isDisabled() {
    const backend = this.state.backend || this.props.defaultBackend;

    if (backend === 'redshift' && !this.props.hasRedshift) {
      return true;
    }

    if (backend === 'snowflake' && !this.props.hasSnowflake) {
      return true;
    }

    if (!this.state.name || !this.state.stage || !backend) {
      return true;
    }

    return this.props.isSaving;
  }
});
