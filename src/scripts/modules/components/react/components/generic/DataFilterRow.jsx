import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Select from '../../../../../react/common/Select';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import ReactSelect from 'react-select';
import { List, Map } from 'immutable';
import _ from 'underscore';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    allTables: PropTypes.object.isRequired,
    groupClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    whereColumnClassName: PropTypes.string
  },

  getDefaultProps() {
    return ({
      groupClassName: 'form-group',
      labelClassName: 'col-xs-2 control-label',
      whereColumnClassName: 'col-xs-4'
    });
  },

  render() {
    return (
      <div className={this.props.groupClassName}>
        <label className={this.props.labelClassName}>Data filter</label>
        <div className={this.props.whereColumnClassName}>
          <Select
            name="where_column"
            value={this.props.value.get('where_column')}
            disabled={this.props.disabled || !this.props.value.get('source')}
            placeholder="Select column"
            onChange={this._handleChangeWhereColumn}
            options={this._getColumnsOptions()} />
        </div>
        <div className="col-xs-2">
          <ReactSelect
            clearable={false}
            backspaceRemoves={false}
            deleteRemoves={false}
            searchable={false}
            name="where_operator"
            value={this.props.value.get('where_operator') || 'eq'}
            disabled={this.props.disabled}
            options={[
              {label: whereOperatorConstants.EQ_LABEL, value: whereOperatorConstants.EQ_VALUE},
              {label: whereOperatorConstants.NOT_EQ_LABEL, value: whereOperatorConstants.NOT_EQ_VALUE}
            ]}
            onChange={this._handleChangeWhereOperator}
          />
        </div>
        <div className="col-xs-4">
          <Select
            name="whereValues"
            value={this.props.value.get('where_values')}
            multi={true}
            disabled={this.props.disabled}
            allowCreate={true}
            delimiter=","
            placeholder="Add a value..."
            emptyStrings={true}
            onChange={this._handleChangeWhereValues} />
        </div>
      </div>
    );
  },

  _getColumns() {
    if (!this.props.value.get('source')) {
      return [];
    }
    const table = this.props.allTables.find((t) => {
      return t.get('id') === this.props.value.get('source');
    }, null, Map());
    return table.get('columns', List()).toJS();
  },

  _getColumnsOptions() {
    const columns = this._getColumns();

    return _.map(
      columns, (column) => {
        return {
          label: column,
          value: column
        };
      }
    );
  },

  _handleChangeWhereValues(newValue) {
    const value = this.props.value.set('where_values', newValue);
    this.props.onChange(value);
  },

  _handleChangeWhereOperator(e) {
    const value = this.props.value.set('where_operator', e.value);
    this.props.onChange(value);
  },

  _handleChangeWhereColumn(string) {
    const value = this.props.value.set('where_column', string);
    this.props.onChange(value);
  }
});
