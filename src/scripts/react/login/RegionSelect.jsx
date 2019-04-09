import React from 'react';
import createReactClass from 'create-react-class';
import Select from 'react-select';

const regions = [
  { value: 'https://connection.keboola.com/', class: 'us', label: 'US' },
  { value: 'https://connection.eu-central-1.keboola.com/', class: 'eu', label: 'EU' },
  { value: 'https://www.keboola.com/contact', class: 'au', label: 'AU' }
];

export default createReactClass({
  getInitialState() {
    return {
      region: regions[0] // asi z url zjistit aktuální hodnotu
    };
  },

  render() {
    return (
      <Select
        className="kbc-select-region"
        clearable={false}
        deleteRemoves={false}
        backspaceRemoves={false}
        arrowRenderer={null}
        value={this.state.region}
        onChange={this.onChange}
        options={regions}
        optionRenderer={this.renderWithFlag}
        valueRenderer={this.renderWithFlag}
      />
    );
  },

  renderWithFlag(option) {
    return (
      <span className="kbc-select-region-option">
        {option.label}
        <span className={option.class} />
      </span>
    );
  },

  onChange(region) {
    // some redirect here.. window.location.href = region.value
    this.setState({ region });
  }
});
