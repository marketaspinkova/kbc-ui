import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { Map } from 'immutable';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Confirm from '../../../../../react/common/Confirm';
import TableauServerCredentialsModal from './TableauServerCredentialsModal';

export default React.createClass({
  propTypes: {
    renderComponent: PropTypes.func,
    renderEnableUpload: PropTypes.func,
    resetUploadTask: PropTypes.func,
    updateLocalStateFn: PropTypes.func,
    localState: PropTypes.object,
    configId: PropTypes.string,
    account: PropTypes.object,
    setConfigDataFn: PropTypes.func
  },

  render() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <Form horizontal>
          <FormGroup>
            <ControlLabel className="col-sm-2">Destination</ControlLabel>
            <FormControl.Static className="col-sm-10" componentClass="div">
              {this.props.renderComponent()}
            </FormControl.Static>
          </FormGroup>
          <FormGroup>
            <ControlLabel className="col-sm-2">Credentials</ControlLabel>
            <FormControl.Static className="col-sm-10" componentClass="div">
              {this._renderAuthorized()}
              {this._renderCredentialsSetup()}
            </FormControl.Static>
          </FormGroup>
          {this._isAuthorized() && (
            <FormGroup>
              <ControlLabel className="col-sm-2">Instant upload</ControlLabel>
              <FormControl.Static className="col-sm-10" componentClass="div">
                {this.props.renderEnableUpload(this._accountName())}
              </FormControl.Static>
            </FormGroup>
          )}
        </Form>
      </div>
    );
  },

  _renderCredentialsSetup() {
    return (
      <div>
        {!this._isAuthorized() && this._renderAuthorizeButton('setup')}
        {this._isAuthorized() && this._renderAuthorizeButton('edit')}
        {this._isAuthorized() && (
          <Confirm
            title="Delete Credentials"
            text={`Do you really want to delete the credentials for ${this.props.account.get('server_url')}`}
            buttonLabel="Delete"
            onConfirm={() => this.props.resetUploadTask()}
          >
            <Button bsStyle="link">
              <i className="fa fa-trash" />
              {' Disconnect Destination'}
            </Button>
          </Confirm>
        )}
      </div>
    );
  },

  _accountName() {
    if (!this.props.account) {
      return '';
    }

    return `${this.props.account.get('username')}@${this.props.account.get('server_url')}`;
  },

  _renderAuthorized() {
    if (!this._isAuthorized()) {
      return <p>No Credentials.</p>;
    }

    return (
      <p>
        {'Authorized for '}
        <strong>{this._accountName()}</strong>
      </p>
    );
  },

  _renderAuthorizeButton(caption) {
    return (
      <Button bsStyle="success" onClick={() => this.props.updateLocalStateFn(['tableauServerModal', 'show'], true)}>
        {caption === 'setup' ? (
          <span>
            <i className="fa fa-user" />
            {' Setup credentials'}
          </span>
        ) : (
          <span>
            <i className="fa fa-pencil" />
            {' Edit credentials'}
          </span>
        )}
        <TableauServerCredentialsModal
          configId={this.props.configId}
          localState={this.props.localState.get('tableauServerModal', Map())}
          updateLocalState={data => this.props.updateLocalStateFn(['tableauServerModal'], data)}
          credentials={this.props.account}
          saveCredentialsFn={credentials => this.props.setConfigDataFn(['parameters', 'tableauServer'], credentials)}
        />
      </Button>
    );
  },

  _isAuthorized() {
    let passwordEmpty = true;

    if (this.props.account) {
      const password = this.props.account.get('password');
      const hashPassword = this.props.account.get('#password');
      passwordEmpty = _.isEmpty(password) && _.isEmpty(hashPassword);
    }

    return (
      this.props.account &&
      !_.isEmpty(this.props.account.get('server_url')) &&
      !_.isEmpty(this.props.account.get('username')) &&
      !_.isEmpty(this.props.account.get('project_name')) &&
      !passwordEmpty
    );
  }
});
