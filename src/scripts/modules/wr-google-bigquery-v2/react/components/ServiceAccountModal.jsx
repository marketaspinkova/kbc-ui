import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Textarea from 'react-textarea-autosize';
import { HelpBlock, Alert } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import { List, fromJS } from 'immutable';

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

const isJsonValid = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export default React.createClass({
  propTypes: {
    onHide: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    documentationLink: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      value: '',
      isJsonValid: false,
      errors: List()
    };
  },

  onChangeValue(e) {
    const jsonString = e.target.value;
    this.setState({
      errors: this.getErrors(jsonString),
      isJsonValid: isJsonValid(jsonString),
      value: jsonString
    });
  },

  getErrors(jsonString) {
    if (!isJsonValid(jsonString)) {
      return List();
    }
    let errors = List();
    const serviceAccountData = fromJS(JSON.parse(jsonString));
    SERVICE_ACCOUNT_REQUIRED_PROPS.forEach((propertyName) => {
      if (!serviceAccountData.has(propertyName)) {
        errors = errors.push(propertyName);
      }
    });
    return errors;
  },

  isValid() {
    return this.state.isJsonValid
      && this.state.errors.count() === 0;
  },

  resetState() {
    this.setState(this.getInitialState());
  },

  onSubmit() {
    this.props.onSubmit(fromJS(JSON.parse(this.state.value)));
    this.resetState();
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  renderErrors() {
    if (this.isValid() || this.state.value === '') {
      return null;
    }
    if (!this.state.isJsonValid) {
      return (
        <Alert bsStyle="danger">
          Provided Service Account Key is not valid JSON object.
        </Alert>
      );
    }
    return (
      <Alert bsStyle="danger">
        <p>Provided Service Account Key does not contain all required properties.</p>
        <p>
          Missing properties:{' '}
          {this.state.errors
            .map((missingProp, index) => {
              return (
                <span key={missingProp}>
                  <strong>{missingProp}</strong>{index + 1 < this.state.errors.count() && ', '}
                </span>
              );
            })
            .toArray()}
          .
        </p>
      </Alert>
    );
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Google Service Account Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form">
            <div className="form-group">
              <Textarea
                label="service_account"
                type="textarea"
                value={this.state.value}
                onChange={this.onChangeValue}
                className="form-control"
                minRows={15}
                maxRows={20}
                placeholder="{}"
              />
              <HelpBlock>
                Copy & paste the whole JSON of the Google service account key file. Please read the details how to create the service account in the
                {' '}
                <ExternalLink href={this.props.documentationLink}>
                  documentation
                </ExternalLink>.
              </HelpBlock>
            </div>
          </form>
          {this.renderErrors()}
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isDisabled={!this.isValid() || this.state.value === ''}
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
