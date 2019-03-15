import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import {fromJS} from 'immutable';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';

export default React.createClass({

  propTypes: {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedComponents: PropTypes.object.isRequired,
    allComponents: PropTypes.object.isRequired
  },

  render() {
    return (
      <Select
        className="kbc-components-selector"
        placeholder="Select component..."
        multi={true}
        disabled={this.props.disabled}
        value={this.props.selectedComponents.toArray()}
        onChange={this.handleSelect}
        optionRenderer={this.optionRenderer}
        valueRenderer={this.optionRenderer}
        options={this.getOptions()}
        filterOption={this.filterOption}
      />
    );
  },

  handleSelect(componentsArray) {
    this.props.onChange(fromJS(componentsArray.map(c => c.value)));
  },

  filterOption(op, filter) {
    if (filter) {
      return !op.isHidden && op.value.includes(filter);
    } else {
      return !op.isHidden;
    }
  },

  getOptions() {
    return this.props.allComponents
      .sortBy((component) => {
        return component.get('name');
      })
      .map((component, componentId) => {
        const componentRender = this.renderComponent(component);
        const isHidden = component.get('flags').includes('excludeFromNewList');
        return {label: componentId, value: componentId, componentRender, isHidden};
      })
      .toArray();
  },

  renderComponent(component) {
    return (
      <span>
        <ComponentIcon component={component}/>
        <ComponentName component={component} showType />
      </span>
    );
  },

  optionRenderer(op) {
    if (op.componentRender) {
      return op.componentRender;
    } else {
      const componentId = op.value;
      const component = this.props.allComponents.find(c => c.get('id') === componentId);
      if (component) {
        return this.renderComponent(component);
      } else {
        return <span> Unknown component {componentId} </span>;
      }
    }
  }

});
