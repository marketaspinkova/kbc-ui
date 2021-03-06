import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Textarea from 'react-textarea-autosize';
import { Checkbox, Col, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

const helpUrl = 'https://help.keboola.com/extractors/database/sqldb/#mysql-encryption';

export default createReactClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    disabledCheckbox: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div>
        {this.renderSslCheckbox('enabled')}
        {this.isEnabled() && (
          <div>
            {this.createInput('SSL Client Certificate (client-cert.pem)', 'cert')}
            {this.createInput('SSL Client Key (client-key.pem)', 'key')}
            {this.createInput('SSL CA Certificate (ca-cert.pem)', 'ca')}
            {this.createInput(
              'SSL Cipher',
              'cipher',
              'You can optionally provide a list of permissible ciphers to use for the SSL encryption.')}
            <FormGroup>
              <Col xs={8} xsOffset={4}>
                <Checkbox
                  checked={this.props.data.get('verifyServerCert', true)}
                  onChange={this.handleToggle.bind(this, 'verifyServerCert')}
                >
                  Verify server certificate
                </Checkbox>
              </Col>
            </FormGroup>
          </div>
        )}
      </div>
    );
  },

  renderSslCheckbox(propName) {
    return (
      <FormGroup>
        <Col xs={8} xsOffset={4}>
          <Checkbox
            disabled={!this.props.isEditing || this.props.disabledCheckbox}
            checked={this.isEnabled()}
            onChange={this.handleToggle.bind(this, propName)}
          >
            Encrypted (SSL) connection {this.renderHelp()}
          </Checkbox>
        </Col>
      </FormGroup>
    );
  },

  createInput(labelValue, propName, help = null) {
    return (
      <FormGroup>
        <Col xs={4} componentClass={ControlLabel}>
          {labelValue}
        </Col>
        <Col xs={8}>
          <Textarea
            label={labelValue}
            disabled={!this.props.isEditing}
            value={this.props.data.get(propName, '')}
            onChange={this.handleChange.bind(this, propName)}
            className="form-control"
            minRows={4}
          />
          {help && <HelpBlock>{help}</HelpBlock>}
        </Col>
      </FormGroup>
    );
  },

  renderHelp() {
    return (
      <ExternalLink href={helpUrl}>
        Help
      </ExternalLink>
    );
  },

  handleChange(propName, event) {
    return this.props.onChange(this.props.data.set(propName, event.target.value));
  },

  handleToggle(propName, event) {
    return this.props.onChange(this.props.data.set(propName, event.target.checked));
  },

  isEnabled() {
    return this.props.data.get('enabled', false);
  }
});
