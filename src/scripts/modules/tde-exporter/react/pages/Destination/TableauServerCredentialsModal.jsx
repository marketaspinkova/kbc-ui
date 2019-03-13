import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { Map } from 'immutable';
import { Col, Modal, Button, ButtonToolbar, HelpBlock, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    saveCredentialsFn: PropTypes.func.isRequired,
    credentials: PropTypes.object,
    localState: PropTypes.object,
    updateLocalState: PropTypes.func
  },

  getInitialState() {
    return {
      credentials: this.props.credentials || Map(),
      isSaving: false
    };
  },

  render() {
    const show = !!(this.props.localState && this.props.localState.get('show'));

    return (
      <Modal show={show} onHide={() => this.props.updateLocalState(Map())}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Setup Credentials to Tableau Server</Modal.Title>
        </Modal.Header>
        <div className="form form-horizontal">
          <Modal.Body>
            {this._createInput(
              'Server URL',
              'server_url',
              'text',
              'use url of your concrete instance, e.g. https://10az.online.tableau.com'
            )}
            {this._createInput('Username', 'username')}
            {this._createInput('Password', 'password', 'password')}
            {this._createInput('Project Name', 'project_name')}
            {this._createInput('Site', 'site')}
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              {this.state.isSaving && <Loader />}
              <Button onClick={() => this.props.updateLocalState(Map())} bsStyle="link">
                Cancel
              </Button>
              <Button
                bsStyle="success"
                disabled={!this._isValid() || this.state.isSaving}
                onClick={() => {
                  this.setState({
                    isSaving: true
                  });
                  const creds = this.state.credentials;
                  let safeCreds = creds.set('#password', creds.get('password'));
                  safeCreds = safeCreds.remove('password');
                  this.props.saveCredentialsFn(safeCreds).then(() => {
                    this.setState({
                      isSaving: false,
                      credentials: safeCreds
                    });
                    this.props.updateLocalState(Map());
                  });
                }}
              >
                <span>Save </span>
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </div>
      </Modal>
    );
  },

  _isValid() {
    return (
      this.state.credentials &&
      !_.isEmpty(this.state.credentials.get('server_url')) &&
      !_.isEmpty(this.state.credentials.get('username')) &&
      !_.isEmpty(this.state.credentials.get('project_name')) &&
      !_.isEmpty(this.state.credentials.get('password'))
    );
  },

  _createInput(labelValue, propName, type = 'text', desc = '') {
    return (
      <FormGroup>
        <Col xs={4} componentClass={ControlLabel}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <FormControl
            type={type}
            placeholder={propName === 'site' ? 'default if empty' : null}
            value={this.state.credentials.get(propName)}
            onChange={event => {
              this.setState({
                credentials: this.state.credentials.set(propName, event.target.value)
              });
            }}
          />
          {desc && <HelpBlock>{desc}</HelpBlock>}
        </Col>
      </FormGroup>
    );
  }
});
