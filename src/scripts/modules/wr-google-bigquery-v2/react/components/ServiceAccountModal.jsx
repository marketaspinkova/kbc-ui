import React from 'react';
import { Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Textarea from 'react-textarea-autosize';
import { HelpBlock, Alert } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Immutable from 'immutable';

const SERVICE_ACCOUNT_REQUIRED_PROPS = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id',
  'auth_uri',
  'token_uri',
  'auth_provider_x509_cert_url',
  'client_x509_cert_url'
];

export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: '',
      isValid: true,
      errors: Immutable.List()
    };
  },

  onChangeValue(e) {
    const jsonString = e.target.value;
    const errors = this.getErrors(jsonString);
    this.setState({
      errors: errors,
      value: jsonString,
      isValid: errors.size === 0
    });
  },

  getErrors(jsonString) {
    let errors = Immutable.List();
    try {
      JSON.parse(jsonString);
    } catch (error) {
      errors = errors.push((
        <li>Invalid JSON.</li>
      ));
      return errors;
    }

    const serviceAccountData = Immutable.fromJS(JSON.parse(jsonString));
    SERVICE_ACCOUNT_REQUIRED_PROPS.forEach((propertyName) => {
      if (!serviceAccountData.has(propertyName)) {
        errors = errors.push((
          <li key={propertyName}>Missing <code>{propertyName}</code> property.</li>
        ));
      }
    });
    return errors;
  },

  isValid() {
    return this.state.isValid;
  },

  resetState() {
    this.setState(this.getInitialState());
  },

  onSubmit() {
    this.props.onSubmit(Immutable.fromJS(JSON.parse(this.state.value)));
    this.resetState();
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  renderErrors() {
    if (this.state.isValid) {
      return null;
    }
    return (
      <Alert bsStyle="warning">
        <ul>
          {this.state.errors.toArray()}
        </ul>
      </Alert>
    );
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Google Service Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form">
            <div className="form-group">
              <Textarea
                label="test2"
                type="textarea"
                value={this.state.value}
                onChange={this.onChangeValue}
                className="form-control"
                minRows={10}
                placeholder="{}"
              />
              <HelpBlock>
                Copy & paste the whole JSON of the private key here. Please read the details how to obtain the service account in the
                {' '}
                <ExternalLink href="https://help.keboola.com/manipulation/transformations/sandbox/#connecting-to-sandbox">
                  documentation
                </ExternalLink>.
              </HelpBlock>
            </div>
          </form>
          {this.renderErrors()}
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isDisabled={!this.isValid() && this.state.value != ''}
            saveLabel="Submit"
            onCancel={this.onHide}
            onSave={this.onSubmit}
            isSaving={false}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});