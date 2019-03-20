import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import _ from 'underscore';
import { Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { Protected, ExternalLink } from '@keboola/indigo-ui';
import fieldsTemplates from '../../../templates/credentialsFields';
import hasSshTunnel from '../../../templates/hasSshTunnel';
import isDockerBasedWriter from '../../../templates/dockerProxyApi';
import Clipboard from '../../../../../react/common/Clipboard';
import Tooltip from '../../../../../react/common/Tooltip';
import SshTunnelRow from '../../../../../react/common/SshTunnelRow';
import TestCredentialsButton from '../../../../../react/common/TestCredentialsButtonGroup';
import contactSupport from '../../../../../utils/contactSupport';

export default createReactClass({
  propTypes: {
    isEditing: PropTypes.bool,
    credentials: PropTypes.object,
    savedCredentials: PropTypes.object,
    onChangeFn: PropTypes.func,
    changeCredentialsFn: PropTypes.func,
    isSaving: PropTypes.bool,
    isProvisioning: PropTypes.bool,
    componentId: PropTypes.string,
    configId: PropTypes.string,
    driver: PropTypes.string,
    testCredentialsFn: PropTypes.func
  },

  render() {
    let provDescription = 'These are read-only credentials to the database provided by Keboola.';

    if (this.props.driver === 'redshift') {
      provDescription = 'These are write credentials to the database provided by Keboola.';
    }

    if (this.props.driver === 'snowflake') {
      provDescription = this._snowflakeDescription();
    }

    const fields = fieldsTemplates(this.props.componentId);

    return (
      <form className="form-horizontal">
        <div className="row kbc-header">
          <div className="kbc-title">
            {this.props.isProvisioning ? (
              <h2>
                Keboola provided database credentials
                <div>
                  <small>{provDescription}</small>
                </div>
              </h2>
            ) : (
              <h2>User specified database credentials</h2>
            )}
          </div>
        </div>
        <div className="kbc-inner-padding">
          {_.map(fields, (field, index) => {
            return this._createInput(
              index,
              field[0],
              field[1],
              field[2],
              field[3],
              field[4],
              field[5],
              field[7]
            );
          })}
          {this._renderSshTunnelRow()}
        </div>
        {this._renderTestCredentials()}
      </form>
    );
  },

  _openSupportModal(e) {
    contactSupport({ type: 'project' });
    e.preventDefault();
    return e.stopPropagation();
  },

  _renderContactUs() {
    return <a onClick={this._openSupportModal}>{' Contact support'}</a>;
  },

  _snowflakeDescription() {
    return <span>These are write credentials to the Snowflake database provided by Keboola.</span>;
  },

  _renderTestCredentials() {
    if (!isDockerBasedWriter(this.props.componentId) || this.props.componentId === 'wr-db-mssql') {
      return null;
    }

    return (
      <TestCredentialsButton
        testCredentialsFn={() => {
          return this.props.testCredentialsFn(this.props.credentials);
        }}
        componentId={this.props.componentId}
        configId={this.props.configId}
        isEditing={this.props.isEditing}
      />
    );
  },

  _renderSshTunnelRow() {
    if (!hasSshTunnel(this.props.componentId) || this.props.isProvisioning) {
      return null;
    }

    return (
      <SshTunnelRow
        onChange={(newSshData) => {
          return this.props.changeCredentialsFn(this.props.credentials.set('ssh', newSshData));
        }}
        data={this.props.credentials.get('ssh', Map())}
        isEditing={this.props.isEditing}
        disabledCheckbox={false}
      />
    );
  },

  _createInput(
    key,
    labelValue,
    inputPropName,
    type = 'text',
    isProtected = false,
    defaultValue = null,
    options = [],
    helpText = null
  ) {
    let propName = inputPropName;

    let isHashed = propName[0] === '#';
    if (this.props.isProvisioning && isHashed) {
      propName = propName.slice(1, propName.length);
      isHashed = false;
    }

    if (this.props.isEditing) {
      if (isHashed) {
        return this._createProtectedInput(labelValue, propName, helpText, key);
      }

      if (type === 'select') {
        return (
          <FormGroup key={key}>
            <Col xs={4} componentClass={ControlLabel}>
              {labelValue}
            </Col>
            <Col xs={8}>
              <FormControl
                componentClass="select"
                disabled={this.props.isSaving}
                value={this.props.credentials.get(propName) || defaultValue}
                onChange={(event) => {
                  return this.props.onChangeFn(propName, event);
                }}
              >
                {_.map(options, (label, value) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </FormControl>
              {helpText && <HelpBlock>{helpText}</HelpBlock>}
            </Col>
          </FormGroup>
        );
      }

      return (
        <FormGroup key={key}>
          <Col xs={4} componentClass={ControlLabel}>
            {labelValue}
          </Col>
          <Col xs={8}>
            <FormControl
              type={type}
              disabled={this.props.isSaving}
              value={this.props.credentials.get(propName) || defaultValue}
              onChange={(event) => {
                return this.props.onChangeFn(propName, event);
              }}
            />
            {helpText && <HelpBlock>{helpText}</HelpBlock>}
          </Col>
        </FormGroup>
      );
    }

    if (isProtected) {
      return this._renderProtectedNoHash(labelValue, propName, key);
    }

    return (
      <FormGroup key={key}>
        <Col xs={4} componentClass={ControlLabel}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <FormControl.Static>
            {type === 'select'
              ? _.find(options, (item, index) => {
                  return index === this.props.credentials.get(propName);
                })
              : this._renderStaticValue(propName)}
            <Clipboard text={this.props.credentials.get(propName)} />
          </FormControl.Static>
        </Col>
      </FormGroup>
    );
  },

  _renderStaticValue(propName) {
    const value = this.props.credentials.get(propName);
    if (this.props.componentId === 'keboola.wr-db-snowflake' && propName === 'host') {
      return <ExternalLink href={`https://${value}`}>{value}</ExternalLink>;
    } else {
      return value;
    }
  },

  _renderProtectedNoHash(labelValue, propName, key) {
    const isHashed = propName[0] === '#';

    return (
      <FormGroup key={key}>
        <Col xs={4} componentClass={ControlLabel}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <FormControl.Static>
            {isHashed ? (
              <Tooltip tooltip="Encrypted password">
                <span className="fa fa-fw fa-lock">{null}</span>
              </Tooltip>
            ) : (
              <span>
                <Protected>{this.props.credentials.get(propName)}</Protected>
                <Clipboard text={this.props.credentials.get(propName)} />
              </span>
            )}
          </FormControl.Static>
        </Col>
      </FormGroup>
    );
  },

  _createProtectedInput(labelValue, propName, helpText = null, key) {
    const savedValue = this.props.savedCredentials.get(propName);

    return (
      <FormGroup key={key}>
        <Col xs={4} componentClass={ControlLabel}>
          {this._renderProtectedLabel(labelValue, !!savedValue)}
        </Col>
        <Col xs={8}>
          <FormControl
            type="password"
            placeholder={savedValue ? 'type new password to change it' : ''}
            value={this.props.credentials.get(propName)}
            onChange={(event) => {
              return this.props.onChangeFn(propName, event);
            }}
          />
          {helpText && <HelpBlock>{helpText}</HelpBlock>}
        </Col>
      </FormGroup>
    );
  },

  _renderProtectedLabel(labelValue, alreadyEncrypted) {
    let msg = `${labelValue} will be stored securely encrypted.`;

    if (alreadyEncrypted) {
      msg = msg + ' The most recently stored value will be used if left empty.';
    }

    return (
      <span>
        {labelValue}
        <small>
          <Tooltip placement="top" tooltip={msg}>
            <span className="fa fa-fw fa-question-circle">{null}</span>
          </Tooltip>
        </small>
      </span>
    );
  }
});
