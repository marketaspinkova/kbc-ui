import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { fromJS } from 'immutable';
import RedshiftDataTypesAddForm from './RedshiftDataTypesAddForm';
import RedshiftDataTypesList from './RedshiftDataTypesList';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired,
    columnsOptions: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      column: '',
      datatype: '',
      size: '',
      compression: '',
      convertEmptyValuesToNull: false
    };
  },

  _handleColumnOnChange(selected) {
    return this.setState({
      column: selected ? selected.value : '',
      size: '',
      compression: ''
    });
  },

  _handleDataTypeOnChange(selected) {
    return this.setState({
      datatype: selected ? selected.value : '',
      size: '',
      compression: ''
    });
  },

  _handleSizeOnChange(value) {
    return this.setState({
      size: value
    });
  },

  _handleCompressionOnChange(selected) {
    return this.setState({
      compression: selected ? selected.value : ''
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
      compression: this.state.compression,
      convertEmptyValuesToNull: this.state.convertEmptyValuesToNull
    };
    const value = this.props.value.set(this.state.column, fromJS(datatype));
    this.props.onChange(value);
    return this.setState({
      column: '',
      datatype: '',
      size: '',
      compression: '',
      convertEmptyValuesToNull: false
    });
  },

  _handleRemoveDataType(key) {
    const value = this.props.value.remove(key);
    return this.props.onChange(value);
  },

  _datatypesMap: {
    SMALLINT: {
      name: 'SMALLINT',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'LZO', 'ZSTD', 'DELTA', 'MOSTLY8']
    },
    INTEGER: {
      name: 'INTEGER',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'LZO', 'ZSTD', 'DELTA', 'DELTA32K', 'MOSTLY8', 'MOSTLY16']
    },
    BIGINT: {
      name: 'BIGINT',
      size: false,
      compression: [
        'RAW',
        'RUNLENGTH',
        'BYTEDICT',
        'LZO',
        'ZSTD',
        'DELTA',
        'DELTA32K',
        'MOSTLY8',
        'MOSTLY16',
        'MOSTLY32'
      ]
    },
    DECIMAL: {
      name: 'DECIMAL',
      size: true,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'LZO', 'ZSTD', 'DELTA32K', 'MOSTLY8', 'MOSTLY16', 'MOSTLY32']
    },
    REAL: {
      name: 'REAL',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'ZSTD']
    },
    'DOUBLE PRECISION': {
      name: 'DOUBLE PRECISION',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'ZSTD']
    },
    BOOLEAN: {
      name: 'BOOLEAN',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'ZSTD']
    },
    CHAR: {
      name: 'CHAR',
      size: true,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'LZO', 'ZSTD']
    },
    VARCHAR: {
      name: 'VARCHAR',
      size: true,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'LZO', 'ZSTD', 'TEXT255', 'TEXT32K']
    },
    DATE: {
      name: 'DATE',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'DELTA', 'DELTA32K', 'ZSTD']
    },
    TIMESTAMP: {
      name: 'TIMESTAMP',
      size: false,
      compression: ['RAW', 'RUNLENGTH', 'BYTEDICT', 'DELTA', 'DELTA32K', 'ZSTD']
    }
  },

  _getDatatypeOptions() {
    return _.keys(this._datatypesMap);
  },

  _getAvailableColumnsOptions() {
    return _.filter(this.props.columnsOptions, option => !_.contains(_.keys(this.props.value.toJS()), option.value));
  },

  render() {
    return (
      <span>
        <RedshiftDataTypesList datatypes={this.props.value} handleRemoveDataType={this._handleRemoveDataType} />
        <RedshiftDataTypesAddForm
          columnValue={this.state.column}
          datatypeValue={this.state.datatype}
          sizeValue={this.state.size}
          compressionValue={this.state.compression}
          convertEmptyValuesToNullValue={this.state.convertEmptyValuesToNull}
          datatypeOptions={this._getDatatypeOptions()}
          showSize={this.state.datatype ? this._datatypesMap[this.state.datatype].size : false}
          compressionOptions={this.state.datatype ? this._datatypesMap[this.state.datatype].compression : []}
          columnsOptions={this.props.columnsOptions}
          columnOnChange={this._handleColumnOnChange}
          datatypeOnChange={this._handleDataTypeOnChange}
          sizeOnChange={this._handleSizeOnChange}
          compressionOnChange={this._handleCompressionOnChange}
          convertEmptyValuesToNullOnChange={this._handleConvertEmptyValuesToNullOnChange}
          handleAddDataType={this._handleAddDataType}
          disabled={this.props.disabled}
          availableColumns={this._getAvailableColumnsOptions()}
        />
      </span>
    );
  }
});
