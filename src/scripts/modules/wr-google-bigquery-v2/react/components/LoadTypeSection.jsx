import React, {PropTypes} from 'react';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col} from 'react-bootstrap';

import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      incremental: PropTypes.bool.isRequired,
      changedSince: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  renderChangedInLast() {
    if (this.props.value.incremental) {
      return (
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Changed In Last
          </Col>
          <Col sm={8}>
            <ChangedSinceInput
              value={this.props.value.changedSince}
              onChange={(newValue) => this.props.onChange({changedSince: newValue})}
              disabled={this.props.disabled || this.props.value.incremental === false}
            />
          </Col>
        </FormGroup>
      );
    }
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Load Type
          </Col>
          <Col sm={8}>
            <Radio
              type="radio"
              title="Full Load"
              disabled={disabled}
              onChange={() => onChange({incremental: false, changedSince: ''})}
              checked={value.incremental === false}>
              Full Load
            </Radio>
            <HelpBlock>
              Data in the target table will be replaced.
            </HelpBlock>
            <Radio
              type="radio"
              title="Incremental"
              disabled={disabled}
              onChange={() => onChange({incremental: true})}
              checked={value.incremental === true}>
              Incremental
            </Radio>
            <HelpBlock>
              Data will be appended to the target table.
            </HelpBlock>
          </Col>
        </FormGroup>
        {this.renderChangedInLast()}
      </Form>
    );
  }
});
