import React from 'react';
import { Map } from 'immutable';
import _ from 'underscore';
import fieldsTemplates from '../../../templates/credentialsFields';
import hasSshTunnel from '../../../templates/hasSshTunnel';
import isDockerBasedWriter from '../../../templates/dockerProxyApi';
import Clipboard from '../../../../../react/common/Clipboard';
import Tooltip from '../../../../../react/common/Tooltip';
import SshTunnelRow from '../../../../../react/common/SshTunnelRow';
import TestCredentialsButton from '../../../../../react/common/TestCredentialsButtonGroup';
import contactSupport from '../../../../../utils/contactSupport';
import { Input, FormControls } from '../../../../../react/common/KbcBootstrap';
import { Protected, ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    isEditing: React.PropTypes.bool,
    credentials: React.PropTypes.object,
    savedCredentials: React.PropTypes.object,
    onChangeFn: React.PropTypes.func,
    changeCredentialsFn: React.PropTypes.func,
    isSaving: React.PropTypes.bool,
    isProvisioning: React.PropTypes.bool,
    componentId: React.PropTypes.string,
    configId: React.PropTypes.string,
    driver: React.PropTypes.string,
    testCredentialsFn: React.PropTypes.func
  },

  render() {
    let provDescription = 'These are readonly credentials to the database provided by Keboola.';

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
              <span>
                <h2>
                  Keboola provided database credentials
                </h2>
                <div className="description description-small">
                  {provDescription}
                </div>
              </span>
            ) : (
              <h2>User specified database credentials</h2>
            )}
          </div>
        </div>
        <div className="kbc-inner-padding">
          {_.map(fields, (field, index) => {
            return this._createInput(index, field[0], field[1], field[2], field[3], field[4], field[5], field[7]);
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
    return <span>These are write credentials to the snowflake database provided by Keboola.</span>;
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
        onChange={newSshData => {
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
    let allOptions;
    let propName = inputPropName;

    if (type === 'select') {
      allOptions = _.map(options, (label, value) => (
        <option key={value} value={value}>
          {label}
        </option>
      ));
    }

    let isHashed = propName[0] === '#';
    if (this.props.isProvisioning && isHashed) {
      propName = propName.slice(1, propName.length);
      isHashed = false;
    }

    if (this.props.isEditing) {
      if (isHashed) {
        return this._createProtectedInput(labelValue, propName, helpText, key);
      }

      return (
        <Input
          key={key}
          label={labelValue}
          type={type}
          disabled={this.props.isSaving}
          value={this.props.credentials.get(propName) || defaultValue}
          help={helpText}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          onChange={event => {
            return this.props.onChangeFn(propName, event);
          }}
        >
          {allOptions}
        </Input>
      );
    }

    if (isProtected) {
      return this._renderProtectedNoHash(labelValue, propName, key);
    }

    return (
      <FormControls.Static key={key} label={labelValue} labelClassName="col-xs-4" wrapperClassName="col-xs-8">
        {type === 'select'
          ? _.find(options, (item, index) => {
            return index === this.props.credentials.get(propName);
          })
          : this._renderStaticValue(propName)}
        <Clipboard text={this.props.credentials.get(propName)} />
      </FormControls.Static>
    );
  },

  _renderStaticValue(propName) {
    const value = this.props.credentials.get(propName);
    if (this.props.componentId === 'keboola.wr-db-snowflake' && propName === 'host') {
      return (
        <ExternalLink href={`https://${value}`}>
          {value}
        </ExternalLink>
      );
    } else {
      return value;
    }
  },

  _renderProtectedNoHash(labelValue, propName, key) {
    const isHashed = propName[0] === '#';
    return (
      <FormControls.Static key={key} label={labelValue} labelClassName="col-xs-4" wrapperClassName="col-xs-8">
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
      </FormControls.Static>
    );
  },

  _createProtectedInput(labelValue, propName, helpText = null, key) {
    const savedValue = this.props.savedCredentials.get(propName);
    return (
      <Input
        key={key}
        label={this._renderProtectedLabel(labelValue, !!savedValue)}
        type="password"
        placeholder={savedValue ? 'type new password to change it' : ''}
        value={this.props.credentials.get(propName)}
        help={helpText}
        labelClassName="col-xs-4"
        wrapperClassName="col-xs-8"
        onChange={event => {
          return this.props.onChangeFn(propName, event);
        }}
      />
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
