import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Form, FormControl, FormGroup, ControlLabel, HelpBlock, Col, Checkbox} from 'react-bootstrap';


export default createReactClass({
  propTypes: {
    value: PropTypes.shape({
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      securityToken: PropTypes.string.isRequired,
      sandbox: PropTypes.bool.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Login Name
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.login}
              onChange={(event) => {
                this.props.onChange({login: event.target.value.trim()});
              }}
              placeholder="john.doe@example.com"
              disabled={this.props.disabled}
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
              onChange={(event) => {
                this.props.onChange({password: event.target.value.trim()});
              }}
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Security Token
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.securityToken}
              onChange={(event) =>  {
                this.props.onChange({securityToken: event.target.value.trim()});
              }}
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.sandbox}
              onChange={(event) =>  {
                this.props.onChange({sandbox: event.target.checked});
              }}
            >Sandbox</Checkbox>
            <HelpBlock>
              Download records from sandbox instead of the production environment.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
