import React, {PropTypes} from 'react';
import {Form, FormControl, FormGroup, ControlLabel, Col, Button} from 'react-bootstrap';
import Modal from './ServiceAccountModal';
import Immutable from 'immutable';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      type: PropTypes.string.isRequired,
      projectId: PropTypes.string.isRequired,
      privateKeyId: PropTypes.string.isRequired,
      privateKey: PropTypes.string.isRequired,
      clientEmail: PropTypes.string.isRequired,
      clientId: PropTypes.string.isRequired,
      authUri: PropTypes.string.isRequired,
      tokenUri: PropTypes.string.isRequired,
      authProviderX509CertUrl: PropTypes.string.isRequired,
      clientX509CertUrl: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  hasValue() {
    return (this.props.value.privateKeyId !== '')
  },

  renderForm() {
    const {value} = this.props;
    return (
      <span>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.projectId}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Email
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.clientEmail}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Key Id
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.privateKeyId}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <p className="text-center">
          <Button bsStyle="danger" onClick={this.deleteServiceAccountKey}>
            Delete Service Account Key
          </Button>
        </p>

      </span>
    );
  },

  deleteServiceAccountKey() {
    this.props.onChange(this.parseValue(Immutable.Map()));
  },

  parseValue(value) {
    return {
      type: value.get('type', ''),
      projectId: value.get('project_id', ''),
      privateKeyId: value.get('private_key_id', ''),
      privateKey: value.get('private_key', ''),
      clientEmail: value.get('client_email', ''),
      clientId: value.get('client_id', ''),
      authUri: value.get('auth_uri', ''),
      tokenUri: value.get('token_uri', ''),
      authProviderX509CertUrl: value.get('auth_provider_x509_cert_url', ''),
      clientX509CertUrl: value.get('client_x509_cert_url', '')
    };
  },

  handleModalSubmit(value) {
    this.setState({showModal: false});
    this.props.onChange(this.parseValue(value));
  },

  renderButton() {
    return (
      <p className="text-center">
        <Button bsStyle="success" onClick={() => this.setState({showModal: true})}>
          Set Service Account Key
        </Button>
      </p>
    );
  },

  render() {
    return (
      <Form horizontal>
        <Modal
          show={this.state.showModal}
          onHide={() => this.setState({showModal: false})}
          onSubmit={this.handleModalSubmit}
        />
        {!this.hasValue() && this.renderButton()}
        {this.hasValue() && this.renderForm()}
      </Form>
    );
  }
});

