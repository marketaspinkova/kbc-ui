import React, {PropTypes} from 'react';
import {FormControl, FormGroup, ControlLabel, Form, Col} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      title: PropTypes.string,
      identifier: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Identifier</Col>
          <Col sm={8}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => onChange({identifier: e.target.value})}
              value={value.identifier}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Title</Col>
          <Col sm={8}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => onChange({title: e.target.value})}
              value={value.title}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
