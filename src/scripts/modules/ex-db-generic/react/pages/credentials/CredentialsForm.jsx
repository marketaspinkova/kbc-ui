import PropTypes from 'prop-types';
import React from 'react';
import {Map} from 'immutable';
import { Checkbox, Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

import TestCredentialsButtonGroup from '../../../../../react/common/TestCredentialsButtonGroup';
import Tooltip from '../../../../../react/common/Tooltip';
import NonStaticSshTunnelRow from '../../../../../react/common/NonStaticSshTunnelRow';
import SSLForm from './SSLForm';

export default React.createClass({
  propTypes: {
    savedCredentials: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isValidEditingCredentials: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    credentialsTemplate: PropTypes.object.isRequired,
    hasSshTunnel: PropTypes.func.isRequired,
    actionCreators: PropTypes.object.isRequired
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
        <Col componentClass={ControlLabel} xs={4}>
          {this.renderProtectedLabel(labelValue, !!savedValue)}
        </Col>
        <Col xs={8}>
          <FormControl
            type="password"
            disabled={!this.props.enabled}
            placeholder={(savedValue) ? 'type a new password to change it' : ''}
            value={this.props.credentials.get(propName)}
            onChange={this.handleChange.bind(this, propName)}
          />
        </Col>
      </FormGroup>
    );
  },

  createInput(labelValue, propName, type = 'text', isProtected = false) {
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
              disabled={!this.props.enabled}
            >
              {labelValue}
            </Checkbox>
          </Col>
        </FormGroup>
      );
    }
    return (
      <FormGroup key={propName}>
        <Col componentClass={ControlLabel} xs={4}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <FormControl
            type={type}
            value={this.props.credentials.get(propName)}
            onChange={this.handleChange.bind(this, propName)}
            disabled={!this.props.enabled}
          />
        </Col>
      </FormGroup>
    );
  },

  renderFields() {
    return this.props.credentialsTemplate.getFields(this.props.componentId).map(function(field) {
      return this.createInput(field.label, field.name, field.type, field.protected);
    }, this);
  },

  sshRowOnChange(sshObject) {
    return this.props.onChange(this.props.credentials.set('ssh', sshObject));
  },

  sslRowOnChange(sslObject) {
    return this.props.onChange(this.props.credentials.set('ssl', sslObject));
  },

  renderSshRow() {
    if (this.props.hasSshTunnel(this.props.componentId)) {
      return (
        <NonStaticSshTunnelRow
          isEditing={this.props.enabled}
          data={this.props.credentials.get('ssh', Map())}
          onChange={this.sshRowOnChange}
          disabledCheckbox={this.props.credentials.getIn(['ssl', 'enabled'], false)}
        />
      );
    }
  },

  renderSSLForm() {
    if (this.props.componentId === 'keboola.ex-db-mysql' || this.props.componentId === 'keboola.ex-db-mysql-custom') {
      return (
        <SSLForm
          isEditing={this.props.enabled}
          data={this.props.credentials.get('ssl', Map())}
          onChange={this.sslRowOnChange}
          disabledCheckbox={this.props.credentials.getIn(['ssh', 'enabled'], false)}
        />
      );
    }
  },

  render() {
    const { componentId, configId, enabled, isValidEditingCredentials, isEditing } = this.props;
    return (
      <form className="form-horizontal">
        <div className="kbc-inner-padding">
          {this.renderFields()}
          {this.renderSshRow()}
          {this.renderSSLForm()}
          <TestCredentialsButtonGroup
            componentId={componentId}
            configId={configId}
            isEditing={isEditing}
            disabled={enabled ? !isValidEditingCredentials : false}
            testCredentialsFn={this.testCredentials}
          />
        </div>
      </form>
    );
  }
});
