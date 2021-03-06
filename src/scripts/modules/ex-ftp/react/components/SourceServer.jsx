import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import {FormControl, FormGroup, ControlLabel, Form, Col, HelpBlock} from 'react-bootstrap';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      connectionType: PropTypes.oneOf(['FTP', 'FTPS', 'SFTP', '']),
      host: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      privateKey: PropTypes.string.isRequired,
      port: PropTypes.number.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>Connection Type</Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.props.value.connectionType}
              onChange={(e) => {
                let port;
                if (e.target.value === 'SFTP') {
                  port = 22;
                } else {
                  port = 21;
                }
                this.props.onChange({connectionType: e.target.value, port: port});
              }}
            >
              <option value="" disabled>Select type</option>
              <option value="FTP">FTP</option>
              <option value="FTPS">FTPS</option>
              <option value="SFTP">SFTP</option>
            </FormControl>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Hostname/IP
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.host}
              onChange={(e) => {
                this.props.onChange({host: e.target.value});
              }}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Port
          </Col>
          <Col sm={8}>
            <FormControl
              type="number"
              value={this.props.value.port}
              onChange={(e) => {
                this.props.onChange({port: e.target.value});
              }}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Username
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.username}
              onChange={(e) => {
                this.props.onChange({username: e.target.value});
              }}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Password
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.password}
              onChange={(e) => {
                this.props.onChange({password: e.target.value});
              }}
            />
          </Col>
        </FormGroup>
        <FormGroup
          className={(this.props.value.connectionType !== 'SFTP') ? 'hidden' : ''}
        >
          <Col componentClass={ControlLabel} sm={4}>
            Private Key
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.privateKey}
              onChange={(e) => {
                this.props.onChange({privateKey: e.target.value});
              }}
            />
            <HelpBlock>
              Only to use with an SFTP connection type. You can paste a private key with or without
              {' '}<code>---BEGIN/END PRIVATE KEY---</code> block.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
