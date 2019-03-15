import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import _ from 'underscore';

export default React.createClass({

  propTypes: {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  },

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(nextProps.value, this.props.value);
  },

  render() {
    return (
      <Select.Creatable
        multi={true}
        isLoading={false}
        value={this.props.value}
        options={this.prepareOptions()}
        // valueRenderer={this.renderValue}
        // optionRenderer={this.renderOption}
        onChange={this.onSelectChange}
        // newOptionCreator={this.createNewOption}
        name="headerColumnNames"
        placeholder="Type new values"
      />
    );
  },

  prepareOptions() {
    const options = this.props.value ? this.props.value.map(o => {return {'value': o, 'label': o};}) : [];
    return options;
  },

  onSelectChange(selectionArray) {
    this.props.onChange(selectionArray ? selectionArray.map(o => o.value) : []);
  },

  renderValue(op) {
    return op.id || op.value;
  },

  createNewOption(input) {
    return {
      create: true,
      value: input,
      label: input
    };
  },

  renderOption(op) {
    const isNew = op.create;

    const data = {
      name: isNew ? op.value : op.attributes.uiName,
      id: isNew ? op.value : op.id
    };

    return (
      <div className="SearchSuggestMatch" key={data.id}>
        <span className="SearchSuggestMatch-category">{data.group}</span>
        <div className="SearchSuggestMatch-content">{data.id} ({data.name || 'n/a'})</div>
        <div className="SearchSuggestMatch-extra">{data.desc}</div>
      </div>
    );
  }
});
