import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { fromJS } from 'immutable';
import SnowflakeDataTypesList from './SnowflakeDataTypesList';
import SnowflakeDataTypesAddForm from './SnowflakeDataTypesAddForm';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      column: '',
      datatype: '',
      size: '',
      convertEmptyValuesToNull: false
    };
  },

  _handleColumnOnChange(selected) {
    return this.setState({
      column: selected ? selected.value : '',
      size: ''
    });
  },

  _handleDataTypeOnChange(selected) {
    return this.setState({
      datatype: selected ? selected.value : '',
      size: ''
    });
  },

  _handleSizeOnChange(value) {
    return this.setState({
      size: value
    });
  },

  _handleConvertEmptyValuesToNullOnChange(value) {
    return this.setState({
      convertEmptyValuesToNull: value
    });
  },

  _handleAddDataType() {
    const datatype = {
      column: this.state.column,
      type: this.state.datatype,
      length: this.state.size,
      convertEmptyValuesToNull: this.state.convertEmptyValuesToNull
    };
    const value = this.props.value.set(this.state.column, fromJS(datatype));
    this.props.onChange(value);
    return this.setState({
      column: '',
      datatype: '',
      size: '',
      convertEmptyValuesToNull: false
    });
  },

  _handleRemoveDataType(key) {
    const value = this.props.value.remove(key);
    return this.props.onChange(value);
  },

  _datatypesMap: {
    NUMBER: {
      name: 'NUMBER',
      size: true
    },
    FLOAT: {
      name: 'FLOAT',
      size: false
    },
    VARCHAR: {
      name: 'VARCHAR',
      size: true
    },
    DATE: {
      name: 'DATE',
      size: false
    },
    TIMESTAMP: {
      name: 'TIMESTAMP',
      size: false
    },
    TIMESTAMP_LTZ: {
      name: 'TIMESTAMP_LTZ',
      size: false
    },
    TIMESTAMP_NTZ: {
      name: 'TIMESTAMP_NTZ',
      size: false
    },
    TIMESTAMP_TZ: {
      name: 'TIMESTAMP_TZ',
      size: false
    },
    VARIANT: {
      name: 'VARIANT',
      size: false
    }
  },
  _getDatatypeOptions() {
    return _.keys(this._datatypesMap);
  },

  _getAvailableColumnsOptions() {
    const component = this;
    return _.filter(
      this.props.columnsOptions,
      option => !_.contains(_.keys(component.props.value.toJS()), option.value)
    );
  },

  render() {
    return (
      <span>
        <SnowflakeDataTypesList datatypes={this.props.value} handleRemoveDataType={this._handleRemoveDataType} />
        <SnowflakeDataTypesAddForm
          datatypes={this.props.value}
          columnValue={this.state.column}
          datatypeValue={this.state.datatype}
          sizeValue={this.state.size}
          convertEmptyValuesToNullValue={this.state.convertEmptyValuesToNull}
          datatypeOptions={this._getDatatypeOptions()}
          showSize={this.state.datatype ? this._datatypesMap[this.state.datatype].size : false}
          columnsOptions={this.props.columnsOptions}
          columnOnChange={this._handleColumnOnChange}
          datatypeOnChange={this._handleDataTypeOnChange}
          sizeOnChange={this._handleSizeOnChange}
          convertEmptyValuesToNullOnChange={this._handleConvertEmptyValuesToNullOnChange}
          handleAddDataType={this._handleAddDataType}
          disabled={this.props.disabled}
          availableColumns={this._getAvailableColumnsOptions()}
        />
      </span>
    );
  }
});
