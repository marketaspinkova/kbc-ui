import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Creatable } from 'react-select';
import changedSinceOptionCreator from './changedSinceOptionCreator';
import changedSinceConstants from './changedSinceConstants';

const selectOptions = [
  { label: changedSinceConstants.ADAPTIVE_LABEL, value: changedSinceConstants.ADAPTIVE_VALUE },
  { label: '10 minutes', value: '-10 minutes' },
  { label: '15 minutes', value: '-15 minutes' },
  { label: '30 minutes', value: '-30 minutes' },
  { label: '45 minutes', value: '-45 minutes' },
  { label: '1 hour', value: '-1 hours' },
  { label: '2 hours', value: '-2 hours' },
  { label: '4 hours', value: '-4 hours' },
  { label: '6 hours', value: '-6 hours' },
  { label: '12 hours', value: '-12 hours' },
  { label: '18 hours', value: '-18 hours' },
  { label: '1 day', value: '-1 days' },
  { label: '2 days', value: '-2 days' },
  { label: '3 days', value: '-3 days' },
  { label: '7 days', value: '-7 days' },
  { label: '15 days', value: '-15 days' },
  { label: '30 days', value: '-30 days' }
];

export default createReactClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    helpBlock: PropTypes.string
  },

  getSelectOptions() {
    if (!this.props.value) {
      return selectOptions;
    }

    const options = [...selectOptions];
    if (options.filter((item) => item.value === this.props.value).length === 0) {
      options.push({
        label: this.props.value.replace('-', ''),
        value: this.props.value
      });
    }
    return options;
  },

  onChange(value) {
    if (!value) {
      this.props.onChange('');
    } else {
      this.props.onChange(value.value);
    }
  },

  isValidNewOption({ label }) {
    return changedSinceOptionCreator(label) !== false;
  },

  newOptionCreator({ label }) {
    const option = changedSinceOptionCreator(label);
    return {
      label: option,
      value: '-' + option
    };
  },

  promptTextCreator(label) {
    const option = changedSinceOptionCreator(label);
    if (option === false) {
      return 'Invalid range';
    }
    return option;
  },

  render() {
    return (
      <div>
        <Creatable
          placeholder="Select range"
          noResultsText="Invalid range"
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.onChange}
          options={this.getSelectOptions()}
          newOptionCreator={this.newOptionCreator}
          isValidNewOption={this.isValidNewOption}
          trimFilter={true}
          promptTextCreator={this.promptTextCreator}
        />
        <span className="help-block">
          Type in any range, e.g. <code>13 hours</code>.
          Supported time dimensions are <code>minutes</code>, <code>hours</code> and <code>days</code>.
          {this.props.helpBlock && (<span>{' '}{this.props.helpBlock}</span>)}
        </span>
      </div>
    );
  }
});
