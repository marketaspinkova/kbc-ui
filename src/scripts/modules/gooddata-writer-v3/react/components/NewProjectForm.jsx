import React, {PropTypes} from 'react';
import {Form, Col, FormControl, ControlLabel, FormGroup} from 'react-bootstrap';
import ReactSelect from 'react-select';

import RadioGroup from 'react-radio-group';
import {Input} from '../../../../react/common/KbcBootstrap';

export default React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired
  },

  handleChange(newDiff) {
    this.props.onChange({...this.props.value, ...newDiff});
  },

  render() {
    const {disabled, value} = this.props;

    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={12}>
            <ReactSelect
              clearable={false}
              disabled={disabled}
              value={value.action}
              onChange={({newValue}) => this.handleChange({action: newValue})}
              options={[
                {label: 'Create new GoodData Project', value: 'create'},
                {label: 'Use Existing GoodData Project', value: 'useExisting'}
              ]}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  },

  renderCreateProject() {
    const {disabled, value} = this.props;
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>Auth Token</Col>
        <Col sm={9}>
          <RadioGroup
            disabled={disabled}
            name="template"
            value={value.action}
            onChange={(e) => this.handleChange({template: e.target.value})}>
            <Input
              type="radio"
              label="Create New GoodData project"
              value="create"
            />
            <Input
              type="radio"
              label="Use existing GoodData project"
              value="useExisting"
            />
          </RadioGroup>

          <FormControl
            type="text"
            disabled={disabled}
            onChange={e => this.handleChange({tokenType: e.target.value})}
            value={value.identifier}
          />
        </Col>
      </FormGroup>
    );
  }
});
