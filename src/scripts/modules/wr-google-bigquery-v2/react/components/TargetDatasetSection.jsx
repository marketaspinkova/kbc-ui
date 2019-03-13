import PropTypes from 'prop-types';
import React from 'react';
import {Form, FormControl, FormGroup, ControlLabel, Col, HelpBlock} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      dataset: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Dataset
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => onChange({dataset: e.target.value})}
              value={value.dataset}
              placeholder="my-dataset"
            />
            <HelpBlock>
              Google BigQuery dataset name.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
