import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {FormControl, FormGroup, ControlLabel, Form, Col} from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      connectionType: PropTypes.oneOf(['FTP', 'FTPS', 'SFTP', '']),
      host: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      privateKey: PropTypes.string.isRequired,
      port: PropTypes.number,
      timeout: PropTypes.number
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>Connection type</Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.props.value.connectionType}
              onChange={function(e) {
                props.onChange({connectionType: e.target.value});
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
              onChange={function(e) {
                props.onChange({host: e.target.value});
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
              onChange={function(e) {
                props.onChange({port: e.target.value});
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
              onChange={function(e) {
                props.onChange({username: e.target.value});
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
              onChange={function(e) {
                props.onChange({password: e.target.value});
              }}
            />
          </Col>
        </FormGroup>
        <FormGroup
          className={(this.props.value.connectionType !== 'SFTP') ? 'hidden' : ''}
        >
          <Col componentClass={ControlLabel} sm={4}>
            Private key
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.privateKey}
              onChange={function(e) {
                props.onChange({privateKey: e.target.value});
              }}
            />
            <div className="help-block">Only to use with SFTP connection type.</div>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Connection timeout
          </Col>
          <Col sm={8}>
            <FormControl
              type="number"
              value={this.props.value.timeout}
              onChange={function(e) {
                props.onChange({timeout: e.target.value});
              }}
            />
            <div className="help-block">Connection timeout in seconds</div>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});