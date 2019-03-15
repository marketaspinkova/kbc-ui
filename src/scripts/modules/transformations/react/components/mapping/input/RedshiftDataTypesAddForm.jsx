import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { Button, FormControl, Checkbox } from 'react-bootstrap';
import Select from 'react-select';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    columnValue: PropTypes.string.isRequired,
    datatypeValue: PropTypes.string.isRequired,
    sizeValue: PropTypes.string.isRequired,
    compressionValue: PropTypes.string.isRequired,
    convertEmptyValuesToNullValue: PropTypes.bool.isRequired,

    columnsOptions: PropTypes.array.isRequired,
    datatypeOptions: PropTypes.array.isRequired,
    compressionOptions: PropTypes.array.isRequired,
    disabled: PropTypes.bool.isRequired,
    showSize: PropTypes.bool.isRequired,

    handleAddDataType: PropTypes.func.isRequired,
    columnOnChange: PropTypes.func.isRequired,
    datatypeOnChange: PropTypes.func.isRequired,
    convertEmptyValuesToNullOnChange: PropTypes.func.isRequired,
    sizeOnChange: PropTypes.func.isRequired,
    compressionOnChange: PropTypes.func.isRequired,

    availableColumns: PropTypes.array.isRequired
  },

  _handleSizeOnChange(e) {
    return this.props.sizeOnChange(e.target.value);
  },

  _getDatatypeOptions() {
    return _.map(this.props.datatypeOptions, datatype => ({
      label: datatype,
      value: datatype
    }));
  },

  _getCompressionOptions() {
    return _.map(this.props.compressionOptions, compression => ({
      label: compression,
      value: compression
    }));
  },

  _convertEmptyValuesToNullOnChange(e) {
    return this.props.convertEmptyValuesToNullOnChange(e.target.checked);
  },

  render() {
    return (
      <div className="well">
        <div className="row">
          <span className="col-xs-4">
            <Select
              name="add-column"
              value={this.props.columnValue}
              disabled={this.props.disabled}
              placeholder="Column"
              onChange={this.props.columnOnChange}
              options={this.props.availableColumns}
            />
          </span>
          <span className="col-xs-3">
            <Select
              name="add-datatype"
              value={this.props.datatypeValue}
              disabled={this.props.disabled}
              placeholder="Datatype"
              onChange={this.props.datatypeOnChange}
              options={this._getDatatypeOptions()}
            />
          </span>
          <span className="col-xs-3">
            <FormControl
              type="text"
              name="add-size"
              value={this.props.sizeValue}
              disabled={this.props.disabled || !this.props.showSize}
              placeholder="Length, eg. 255"
              onChange={this._handleSizeOnChange}
            />
          </span>
          <span className="col-xs-2">
            <Select
              name="add-datatype-compression"
              value={this.props.compressionValue}
              disabled={this.props.disabled}
              placeholder="Compression"
              onChange={this.props.compressionOnChange}
              options={this._getCompressionOptions()}
            />
          </span>
        </div>
        <div className="row">
          <span className="col-xs-6">
            <Checkbox
              checked={this.props.convertEmptyValuesToNullValue}
              onChange={this._convertEmptyValuesToNullOnChange}
            >
              <span>
                Convert empty values to <code>null</code>
              </span>
            </Checkbox>
          </span>
          <span className="col-xs-6 text-right">
            <Button
              className="btn-success"
              onClick={this.props.handleAddDataType}
              disabled={this.props.disabled || !this.props.columnValue || !this.props.datatypeValue}
            >
              Create data type
            </Button>
          </span>
        </div>
        <div className="help-block">
          <div>
            <code>VARCHAR(255) ENCODE LZO</code>
            default for primary key columns
          </div>
          <div>
            <code>VARCHAR(65535) ENCODE LZO</code>
            default for all other columns
          </div>
        </div>
      </div>
    );
  }
});
