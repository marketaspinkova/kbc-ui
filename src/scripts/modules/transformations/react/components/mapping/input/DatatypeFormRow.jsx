import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormControl, Checkbox } from 'react-bootstrap';
import Select from 'react-select';

export default createReactClass({

  propTypes: {
    columnName: PropTypes.string.isRequired,
    datatype: PropTypes.object.isRequired,
    datatypesMap: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      hovered: false
    };
  },

  lengthEnabled() {
    const selectedType = this.props.datatypesMap.filter((datatype) => {
      return datatype.get('name') === this.props.datatype.get('type');
    });
    return selectedType.get(this.props.datatype.get('type'))
      && selectedType.get(this.props.datatype.get('type')).get('size');
  },

  handleTypeChange(newType) {
    if (newType) {
      this.props.onChange(
        this.props.datatype
          .set('length', null)
          .set('type', newType.value)
      );
    }
  },

  handleLengthChange(e) {
    this.props.onChange(this.props.datatype.set('length', e.target.value || null));
  },

  handleNullableChange(e) {
    this.props.onChange(this.props.datatype.set('convertEmptyValuesToNull', e.target.checked));
  },

  getTypeOptions() {
    return Object.keys(this.props.datatypesMap.toJS()).map(option => {
      return {
        label: option,
        value: option
      };
    }).sort((valueA, valueB) => {
      if (valueA.label < valueB.label) {
        return -1;
      }
      if (valueA.label > valueB.label) {
        return 1;
      }
      return 0;
    });
  },

  setHoveredTrue() {
    this.setState({
      hovered: true
    });
  },

  setHoveredFalse() {
    this.setState({
      hovered: false
    });
  },

  getCheckboxLabel() {
    if (this.state.hovered) {
      return (
        <span>Empty values as <code>null</code></span>
      );
    } else {
      return (
        <span>&nbsp;</span>
      );
    }
  },

  render() {
    return (
      <tr onMouseEnter={this.setHoveredTrue} onMouseLeave={this.setHoveredFalse} >
        <td>
          <strong>{this.props.columnName}</strong>
        </td>
        <td>
          <Select
            name={this.props.columnName + '_datatype'}
            value={this.props.datatype.get('type')}
            options={this.getTypeOptions()}
            onChange={this.handleTypeChange}
            disabled={this.props.disabled}
            autosize={false}
            clearable={false}
          />
        </td>
        <td>
          {this.lengthEnabled() && (
            <FormControl
              name={this.props.columnName + '_length'}
              type="text"
              size={15}
              value={this.props.datatype.get('length')}
              onChange={this.handleLengthChange}
              disabled={this.props.disabled || !this.lengthEnabled()}
              placeholder="Length, eg. 38,0"
            />
          )}
        </td>
        <td>
          <Checkbox
            name={this.props.columnName + '_nullable'}
            checked={this.props.datatype.get('convertEmptyValuesToNull')}
            onChange={this.handleNullableChange}
          >
            {this.getCheckboxLabel()}
          </Checkbox>
        </td>
      </tr>
    );
  }
});
