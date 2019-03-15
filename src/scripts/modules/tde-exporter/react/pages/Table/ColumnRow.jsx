import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { FormControl, InputGroup, FormGroup } from 'react-bootstrap';
import ColumnDataPreview from '../../../../components/react/components/ColumnDataPreview';
import DateFormatHint from './DateFormatHint';

const columnTdeTypes = ['string', 'boolean', 'number', 'decimal', 'date', 'datetime'];
const defaults = {
  date: '%Y-%m-%d',
  datetime: '%Y-%m-%d %H:%M:%S'
};

/*  FORMAT HINTS TODO
<ul>
  <li>%Y – year (e.g. 2010)</li>
  <li>%m – month (01 - 12)</li>
  <li>%d – day (01 - 31)</li>
  <li>%I – hour (01 - 12)</li>
  <li>%H – hour 24 format (00 - 23)</li>
  <li>%M – minutes (00 - 59)</li>
  <li>%S – seconds (00 - 59)</li>
  <li>%f – microsecond as a decimal number, zero-padded on the left.(000000, 000001, ..., 999999)</li>
</ul>
*/

export default createReactClass({
  propTypes: {
    isSaving: PropTypes.bool.isRequired,
    column: PropTypes.string,
    tdeType: PropTypes.object,
    editing: PropTypes.object,
    dataPreview: PropTypes.object,
    onChange: PropTypes.func
  },

  render() {
    if (this.props.editing) {
      return this._renderEditing();
    }

    return (
      <tr>
        <td>{this.props.column}</td>
        <td>{this._renderStaticType()}</td>
        <td>
          <ColumnDataPreview columnName={this.props.column} tableData={this.props.dataPreview} />
        </td>
      </tr>
    );
  },

  _renderStaticType() {
    const type = this.props.tdeType.get('type') || 'IGNORE';
    const format = this.props.tdeType.get('format');

    if (['date', 'datetime'].includes(type)) {
      return <span>{`${type} (${format})`}</span>;
    }

    return <span>{type}</span>;
  },

  _renderEditing() {
    return (
      <tr>
        <td>{this.props.column}</td>
        <td>{this._renderTypeSelect()}</td>
        <td>
          <ColumnDataPreview columnName={this.props.column} tableData={this.props.dataPreview} />
        </td>
      </tr>
    );
  },

  _renderTypeSelect() {
    const dtype = this.props.editing.get('type');
    const showFormat = ['date', 'datetime'].includes(dtype);

    return (
      <div className="form form-horizontal">
        <div className="col-sm-5">
          <select
            className="form-control"
            type="select"
            value={dtype}
            disabled={this.props.isSaving}
            onChange={e => {
              let newData = this.props.editing.set('type', e.target.value);
              if (!['date', 'datetime'].includes(e.target.value) || e.target.value === 'IGNORE') {
                newData = newData.delete('format');
              }
              if (e.target.value === 'date') {
                newData = newData.set('format', defaults.date);
              }
              if (e.target.value === 'datetime') {
                newData = newData.set('format', defaults.datetime);
              }
              this.props.onChange(newData);
            }}
          >
            {this._selectOptions()}
          </select>
        </div>
        {showFormat && (
          <FormGroup className="col-sm-7">
            <InputGroup>
              {this._renderDatetFormatInput()}
              <InputGroup.Addon>
                <DateFormatHint />
              </InputGroup.Addon>
            </InputGroup>
          </FormGroup>
        )}
      </div>
    );
  },

  _renderDatetFormatInput() {
    const format = this.props.editing.get('format');

    return (
      <FormControl
        type="text"
        value={format}
        disabled={this.props.isSaving}
        onChange={e => {
          const newData = this.props.editing.set('format', e.target.value);
          this.props.onChange(newData);
        }}
      />
    );
  },

  _selectOptions() {
    return _.map(columnTdeTypes.concat('IGNORE'), opKey => (
      <option value={opKey} key={opKey}>
        {opKey}
      </option>
    ));
  }
});
