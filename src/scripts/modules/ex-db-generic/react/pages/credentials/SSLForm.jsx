import React from 'react';

import Textarea from 'react-textarea-autosize';
import {Input} from './../../../../../react/common/KbcBootstrap';
import {HelpBlock} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';

const helpUrl = 'https://help.keboola.com/extractors/database/sqldb/#mysql-encryption';

export default React.createClass({
  displayName: 'SSLForm',
  propTypes: {
    onChange: React.PropTypes.func,
    data: React.PropTypes.object.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    disabledCheckbox: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      onChange: () => {}
    };
  },

  handleChange(propName, event) {
    return this.props.onChange(this.props.data.set(propName, event.target.value));
  },

  handleToggle(propName, event) {
    return this.props.onChange(this.props.data.set(propName, event.target.checked));
  },

  isEnabled() {
    return this.props.data.get('enabled', false);
  },

  renderSslCheckbox(propName) {
    return (
      <Input
        disabled={!this.props.isEditing || this.props.disabledCheckbox}
        type="checkbox"
        label={<span>Encrypted (SSL) connection {this.renderHelp()}</span>}
        wrapperClassName="col-xs-8 col-xs-offset-4"
        checked={this.isEnabled()}
        onChange={this.handleToggle.bind(this, propName)}
      />
    );
  },

  createInput(labelValue, propName, help = null) {
    return (
      <div>
        <div className="form-group">
          <label className="control-label col-xs-4">
            {labelValue}
          </label>
          <div className="col-xs-8">
            <Textarea
              label={labelValue}
              type="textarea"
              disabled={!this.props.isEditing}
              value={this.props.data.get(propName)}
              onChange={this.handleChange.bind(this, propName)}
              className="form-control"
              minRows={4}
            />
            {help && <HelpBlock>{help}</HelpBlock>}
          </div>
        </div>
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.renderSslCheckbox('enabled')}
        {this.isEnabled() ?
          <div>
            {this.createInput('SSL Client Certificate (client-cert.pem)', 'cert')}
            {this.createInput('SSL Client Key (client-key.pem)', 'key')}
            {this.createInput('SSL CA Certificate (ca-cert.pem)', 'ca')}
            {this.createInput(
              'SSL Cipher',
              'cipher',
              'You can optionally provide a list of permissible ciphers to use for the SSL encryption.')}
          </div>
          : null
        }
      </div>
    );
  },

  renderHelp() {
    return (
      <span>
        <ExternalLink href={helpUrl}>
          Help
        </ExternalLink>
      </span>
    );
  }
});
