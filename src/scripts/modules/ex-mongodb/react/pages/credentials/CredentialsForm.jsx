import React from 'react';
import {Map} from 'immutable';
import {Col, Checkbox, Form, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import Clipboard from '../../../../../react/common/Clipboard';
import TestCredentialsButtonGroup from '../../../../../react/common/TestCredentialsButtonGroup';
import Tooltip from '../../../../../react/common/Tooltip';
import SshTunnelRow from '../../../../../react/common/SshTunnelRow';

export default React.createClass({
  propTypes: {
    savedCredentials: React.PropTypes.object.isRequired,
    credentials: React.PropTypes.object.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    isValidEditingCredentials: React.PropTypes.bool.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    credentialsTemplate: React.PropTypes.object.isRequired,
    actionCreators: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      onChange: () => null
    };
  },

  testCredentials() {
    return this.props.actionCreators.testCredentials(this.props.configId, this.props.credentials);
  },

  handleChange(propName, event) {
    let value = event.target.value;
    if (['port'].indexOf(propName) >= 0) {
      value = parseInt(event.target.value, 10);
    }
    return this.props.onChange(this.props.credentials.set(propName, value));
  },

  handleCheckboxChange(propName, e) {
    return this.props.onChange(this.props.credentials.set(propName, e.target.checked));
  },

  renderProtectedLabel(labelValue, alreadyEncrypted) {
    let msg = labelValue + 'will be stored securely encrypted.';
    if (alreadyEncrypted) {
      msg = msg + ' The most recently stored value will be used if left empty.';
    }
    return (
      <span>
        {labelValue}
        <small>
          <Tooltip tooltip={msg}>
            <span className="fa fa-fw fa-question-circle"/>
          </Tooltip>
        </small>
      </span>
    );
  },

  createProtectedInput(labelValue, propName) {
    let savedValue = this.props.savedCredentials.get(propName);

    return (
      <FormGroup key={propName}>
        <Col xs={4} componentClass={ControlLabel}>
          {this.renderProtectedLabel(labelValue, !!savedValue)}
        </Col>
        <Col xs={8}>
          <FormControl
            type="password"
            placeholder={(savedValue) ? 'type new password to change it' : ''}
            value={this.props.credentials.get(propName)}
            onChange={this.handleChange.bind(this, propName)}
          />
        </Col>
      </FormGroup>
    );
  },

  createInput(labelValue, propName, type = 'text', isProtected = false) {
    if (this.props.enabled) {
      if (isProtected) {
        return this.createProtectedInput(labelValue, propName);
      }

      if (type === 'checkbox') {
        return (
          <FormGroup key={propName}>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.credentials.get(propName)}
                onChange={this.handleCheckboxChange.bind(this, propName)}
              />
            </Col>
          </FormGroup>
        );
      }

      return (
        <FormGroup key={propName}>
          <Col xs={4} componentClass={ControlLabel}>
            {labelValue}
          </Col>
          <Col xs={8}>
            <FormControl
              type={type}
              value={this.props.credentials.get(propName)}
              onChange={this.handleChange.bind(this, propName)}
            />
          </Col>
        </FormGroup>
      );
    }
    
    if (isProtected) {
      return (
        <FormGroup key={propName}>
          <Col xs={4} componentClass={ControlLabel}>
            {labelValue}
          </Col>
          <Col xs={8}>
            <FormControl.Static>
              <Tooltip tooltip="Encrypted password">
                <i className="fa fa-fw fa-lock"/>
              </Tooltip>
            </FormControl.Static>
          </Col>
        </FormGroup>
      );
    }

    return (
      <FormGroup key={propName}>
        <Col xs={4} componentClass={ControlLabel}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <FormControl.Static>
            {this.props.credentials.get(propName)}
            {this.props.credentials.get(propName) && (
              <Clipboard text={this.props.credentials.get(propName).toString()}/>
            )}
          </FormControl.Static>
        </Col>
      </FormGroup>
    );
  },

  renderFields() {
    return this.props.credentialsTemplate.getFields().map((field) => {
      return this.createInput(field.label, field.name, field.type, field.protected);
    });
  },

  sshRowOnChange(sshObject) {
    return this.props.onChange(this.props.credentials.set('ssh', sshObject));
  },

  render() {
    const { componentId, configId, enabled, isValidEditingCredentials, isEditing } = this.props;

    return (
      <Form horizontal>
        <div className="kbc-inner-padding">
          {this.renderFields()}
          <SshTunnelRow
            isEditing={this.props.enabled}
            data={this.props.credentials.get('ssh', Map())}
            onChange={this.sshRowOnChange}
            disabledCheckbox={false}
          />
          <TestCredentialsButtonGroup
            componentId={componentId}
            configId={configId}
            isEditing={isEditing}
            disabled={enabled ? !isValidEditingCredentials : false}
            testCredentialsFn={this.testCredentials}
          />
        </div>
      </Form>
    );
  }
});

