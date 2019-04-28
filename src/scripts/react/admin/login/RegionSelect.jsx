import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Select from 'react-select';

const regions = [
  { value: 'US', label: 'US', link: 'https://connection.keboola.com/', class: 'us' },
  { value: 'EU', label: 'EU', link: 'https://connection.eu-central-1.keboola.com/', class: 'eu' },
  { value: 'AU', label: 'AU', link: 'https://www.keboola.com/contact', class: 'au' }
];

export default createReactClass({
  propTypes: {
    activeRegion: PropTypes.string.isRequired
  },

  render() {
    return (
      <span title="Select region">
        <Select
          className="kbc-select-region"
          clearable={false}
          deleteRemoves={false}
          backspaceRemoves={false}
          arrowRenderer={null}
          value={this.props.activeRegion}
          onChange={this.onChange}
          options={regions}
          optionRenderer={this.renderWithFlag}
          valueRenderer={this.renderWithFlag}
        />
      </span>
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
    if (this.props.activeRegion !== region.value) {
      window.location.href = region.link
    }
  }
});
