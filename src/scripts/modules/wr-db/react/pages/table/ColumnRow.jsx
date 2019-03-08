import React from 'react';
import _ from 'underscore';
import { Check } from '@keboola/indigo-ui';
import { FormGroup, FormControl } from 'react-bootstrap';
import ColumnDataPreview from '../../../../components/react/components/ColumnDataPreview';

export default React.createClass({
  propTypes: {
    column: React.PropTypes.object,
    editingColumn: React.PropTypes.object,
    editColumnFn: React.PropTypes.func,
    dataTypes: React.PropTypes.array,
    isSaving: React.PropTypes.bool,
    dataPreview: React.PropTypes.object,
    isValid: React.PropTypes.bool,
    disabledFields: React.PropTypes.array
  },

  render() {
    if (this.props.editingColumn) {
      return this._renderEditing();
    } else {
      return this._renderStatic();
    }
  },

  _renderEditing() {
    let trClass;
    if (!this.props.isValid) {
      trClass = 'danger';
    }
    return (
      <tr className={trClass}>
        <td className="kbc-static-cell">{this.props.column.get('name')}</td>
        <td>{this._createInput('dbName')}</td>
        {this._renderTypeSelect()}
        <td>{this._createCheckbox('null')}</td>
        <td>{this._createInput('default')}</td>
        <td>
          <ColumnDataPreview columnName={this.props.column.get('name')} tableData={this.props.dataPreview} />
        </td>
      </tr>
    );
  },

  _renderTypeSelect() {
    const dtype = this.props.editingColumn.get('type');
    return (
      <td>
        <FormGroup bsSize="small">
          <FormControl
            componentClass="select"
            value={dtype}
            disabled={this.props.isSaving}
            onChange={e => {
              const { value } = e.target;
              let newColumn = this.props.editingColumn.set('type', value);
              if (value === 'IGNORE') {
                newColumn = newColumn.set('default', '');
              }
              if (_.isString(this._getSizeParam(value))) {
                const defaultSize = this._getSizeParam(value);
                newColumn = newColumn.set('size', defaultSize);
              } else {
                newColumn = newColumn.set('size', '');
              }
              return this.props.editColumnFn(newColumn);
            }}
          >
            {this._selectOptions()}
          </FormControl>
        </FormGroup>{' '}
        {_.isString(this._getSizeParam(dtype)) && this._createInput('size')}
      </td>
    );
  },

  _getSizeParam(dataType) {
    const dt = _.find(this.props.dataTypes, d => _.isObject(d) && _.keys(d)[0] === dataType);
    return dt && dt[dataType] && dt[dataType].defaultSize;
  },

  _getDataTypes() {
    return _.map(this.props.dataTypes, dataType => {
      // it could be object eg {VARCHAR: {defaultSize:''}}
      if (_.isObject(dataType)) {
        return _.keys(dataType)[0];
      } else {
        // or string
        return dataType;
      }
    });
  },

  _selectOptions() {
    const dataTypes = this._getDataTypes();
    return _.map(dataTypes.sort().concat('IGNORE'), opKey => (
      <option value={opKey} key={opKey}>
        {opKey}
      </option>
    ));
  },

  _createCheckbox(property) {
    if (property === 'null' && this.props.disabledFields.includes('nullable')) {
      return '';
    }
    if (this.props.editingColumn.get('type') === 'IGNORE') {
      return '';
    }
    const isChecked = this.props.editingColumn.get(property) === '1';
    return (
      <div className="text-center checkbox">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => {
            const newValue = e.target.checked ? '1' : '0';
            const newColumn = this.props.editingColumn.set(property, newValue);
            return this.props.editColumnFn(newColumn);
          }}
        />
      </div>
    );
  },

  _createInput(property) {
    if (property === 'default' && this.props.disabledFields.includes('default')) {
      return '';
    }

    if (this.props.editingColumn.get('type') === 'IGNORE') {
      return '';
    }

    return (
      <FormGroup bsSize="small">
        <FormControl
          type="text"
          value={this.props.editingColumn.get(property)}
          disabled={this.props.isSaving}
          onChange={e => {
            const newValue = e.target.value;
            const newColumn = this.props.editingColumn.set(property, newValue);
            return this.props.editColumnFn(newColumn);
          }}
        />
      </FormGroup>
    );
  },

  _renderStatic() {
    return (
      <tr>
        <td className="kbc-static-cell">{this.props.column.get('name')}</td>
        <td className="kbc-static-cell">{this.props.column.get('dbName')}</td>
        {this._renderType()}
        {this._renderNull()}
        {this._renderDefault()}
        <td>
          <ColumnDataPreview columnName={this.props.column.get('name')} tableData={this.props.dataPreview} />
        </td>
      </tr>
    );
  },

  _renderDefault() {
    let val = this.props.column.get('default');
    if (this._isIgnored()) {
      val = 'N/A';
    }
    if (this.props.disabledFields.includes('default')) {
      val = '';
    }
    return <td className="kbc-static-cell">{val}</td>;
  },

  _renderType() {
    let type = this.props.column.get('type');
    const size = this.props.column.get('size');
    if (size) {
      type = `${type}(${size})`;
    }
    return <td className="kbc-static-cell">{type}</td>;
  },

  _renderNull() {
    const isChecked = this.props.column.get('null') === '1';
    let nullVal = <Check isChecked={isChecked} />;
    if (this._isIgnored()) {
      nullVal = 'N/A';
    }
    if (this.props.disabledFields.includes('nullable')) {
      nullVal = '';
    }
    return <td className="kbc-static-cell">{nullVal}</td>;
  },

  _isIgnored() {
    return this.props.column.get('type') === 'IGNORE';
  }
});
