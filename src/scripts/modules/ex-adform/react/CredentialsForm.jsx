import React, {PropTypes} from 'react';
import { Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    credentials: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  },
  render() {
    return (
      <div className="form-horizontal">
        <HelpBlock>Please provide your Adform credentials.</HelpBlock>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>
            Username
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              autoFocus
              value={this.props.credentials.get('username')}
              onChange={this.handleChange.bind(this, 'username')}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>
            Password
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.credentials.get('#password')}
              onChange={this.handleChange.bind(this, '#password')}
            />
          </Col>
        </FormGroup>
      </div>
    );
  },

  handleChange(field, e) {
    this.props.onChange(this.props.credentials.set(field, e.target.value));
  }
});
