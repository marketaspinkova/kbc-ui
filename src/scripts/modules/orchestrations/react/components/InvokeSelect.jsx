import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ORCHESTRATION_INVOKE_TYPE } from '../../Constants';
import { FormGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

const scheduleTypes = [
  {
    label: 'Time Schedule',
    value: ORCHESTRATION_INVOKE_TYPE.TIME
  },
  {
    label: 'Event Trigger',
    value: ORCHESTRATION_INVOKE_TYPE.EVENT
  },
];

export default createReactClass({
  propTypes: {
    selectedValue: PropTypes.string.isRequired,
    onSelectValue: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <FormGroup>
        <ToggleButtonGroup
          name="scheduleType"
          value={this.props.selectedValue}
          onChange={this.props.onSelectValue}
          vertical
          block
        >
          {scheduleTypes.map((item) => {
            return (
              <ToggleButton
                type="radio"
                key={`trigger-type-${item.value}`}
                value={item.value}
                disabled={this.props.disabled}
                bsSize="large"
                block
              >
                <div className="text-left">
                  {this._renderCircleIcon(this.props.selectedValue === item.value)}
                  {'  '}
                  {this._renderTypeIcon(item.value)}
                  {' '}
                  <strong>{item.label}</strong>
                  </div>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </FormGroup>
    );
  },

  _renderCircleIcon(active) {
    const iconName = active ? 'fa-dot-circle-o' : 'fa-circle-o';
    return (<i className={`fa fa-fw ${iconName}`} />);
  },

  _renderTypeIcon(value) {
    const iconName = (value === ORCHESTRATION_INVOKE_TYPE.TIME) ? 'fa-clock-o' : 'fa-list-alt';
    return (<i className={`fa fa-fw ${iconName}`} />);
  }
});
