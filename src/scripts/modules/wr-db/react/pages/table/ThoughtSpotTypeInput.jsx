import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactSelect from 'react-select';

export default createReactClass({
  propTypes: {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      value: 'standard'
    };
  },

  render() {
    return (
      <div className="form-group">
        <label className="control-label col-sm-3">
          Table Type
        </label>
        <div className="col-sm-3">
          <ReactSelect
            type="select"
            searchable={true}
            name="tableType"
            value={this.props.value}
            disabled={this.props.disabled}
            clearable={false}
            options={[
              {label: 'STANDARD', value: 'standard'},
              {label: 'FACT', value: 'fact'},
              {label: 'DIMENSION', value: 'dimension'}
            ]}
            onChange={(e) => this.props.onChange(e.value)}
          />
        </div>
      </div>
    );
  }
});
