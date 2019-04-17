import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
// import fuzzy from 'fuzzy';
import Select from 'react-select';
import Tooltip from '../../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';

function simpleMatch(query, test) {
  return test.toLocaleLowerCase().indexOf(query.toLowerCase()) >= 0;
}

export default createReactClass({
  propTypes: {
    selectedValues: PropTypes.array.isRequired,
    onSelectValue: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isLoadingMetadata: PropTypes.bool.isRequired,
    metadata: PropTypes.array.isRequired,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    preferedOrderIds: PropTypes.array
  },

  getDefaultProps() {
    return {
      preferedOrderIds: [],
      labelClassName: 'col-md-2 control-label',
      wrapperClassName: 'col-md-10'
    };
  },

  filterOption(op, filter) {
    const isNew = op.create;
    const data = {
      group: isNew ? '' : op.attributes.group,
      name: isNew ? op.value : op.attributes.uiName,
      desc: isNew ? '' : op.attributes.description,
      id: isNew ? op.value : op.id
    };
    return !!simpleMatch(filter, data.group) ||
           !!simpleMatch(filter, data.name) ||
           !!simpleMatch(filter, data.id);
  },

  createNewOption({ label }) {
    const found = this.props.metadata.find((m) => m.id === label);
    if (found) {
      return found;
    } else {
      return {
        create: true,
        value: label,
        label: label
      };
    }
  },

  renderOption(op) {
    const isNew = op.create;

    const data = {
      group: isNew ? 'N/A' : op.attributes.group,
      name: isNew ? op.value : op.attributes.uiName,
      desc: isNew ? '' : op.attributes.description,
      id: isNew ? op.value : op.id
    };

    return (
      <div className="SearchSuggestMatch" key={data.id}>
        <span className="SearchSuggestMatch-category">{data.group}</span>
        <div className="SearchSuggestMatch-content">{data.id} ({data.name || 'n/a'})</div>
        <div className="SearchSuggestMatch-extra">{data.desc}</div>
      </div>
    );
  },

  prepareOptionsData(data) {
    const order = this.props.preferedOrderIds;
    const alldata = data.map((op) => {
      op.value = op.id;
      return op;
    });
    // const preferedOrderData = alldata.filter((d) => order.includes(d.id));
    const orderedData = order
      .filter((i) => alldata.find((pi) => pi.id === i))
      .map((i) => alldata.find((pi) => pi.id === i));

    const restData = alldata.filter((d) => !order.includes(d.id))
      .sort((a, b) => a.attributes.group.localeCompare(b.attributes.group));
    return orderedData.concat(restData);
  },


  render() {
    if (!this.props.isEditing) {
      return this.renderStatic();
    }

    return (
      <div className="form-group">
        <label className={this.props.labelClassName}>
          {this.props.name}
        </label>
        <div className={this.props.wrapperClassName}>
          <Select.Creatable
            multi={true}
            isLoading={this.props.isLoadingMetadata}
            value={this.prepareValue(this.props.selectedValues)}
            filterOption={this.filterOption}
            optionRenderer={this.renderOption}
            options={this.prepareOptionsData(this.props.metadata)}
            onChange={this.props.onSelectValue}
            newOptionCreator={this.createNewOption}
            name={name}
          />
        </div>
      </div>
    );
  },

  prepareValue(list) {
    return list.map((item) => {
      return {
        label: item,
        value: item,
        className: 'Select-create-option-placeholder'
      };
    });
  },

  renderStatic() {
    return (
      <div className="form-group">
        <label className={'control-label ' + this.props.labelClassName}>
          {this.props.name}
          {this.props.isLoadingMetadata ? <span>{' '}<Loader/></span> : null}
        </label>
        <div className={this.props.wrapperClassName}>
          <p className="form-control-static">
            {(this.props.selectedValues.length > 0) ?
              this.props.selectedValues.map((val, idx) => this.renderStaticOption(val, idx))
              : 'N/A'
            }
          </p>
        </div>
      </div>
    );
  },

  renderStaticOption(optionId, idx) {
    const option = this.props.metadata.find((op) => op.id === optionId);
    const desc = option ? option.attributes.description : '';
    const name = option ? option.attributes.uiName : '';
    const isLast = idx === this.props.selectedValues.length - 1;
    return (
      <span key={idx}>
        <Tooltip tooltip={desc} placement="top">
          <span>
            {optionId}({name || 'n/a'})
          </span>
        </Tooltip>
        {isLast ? '' : ', '}
      </span>
    );
  }
});
