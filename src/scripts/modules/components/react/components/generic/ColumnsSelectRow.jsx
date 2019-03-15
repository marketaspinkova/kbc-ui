import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { List, Map } from 'immutable';
import Select from '../../../../../react/common/Select';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    allTables: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="form-group">
        <label className="col-xs-2 control-label"> Columns</label>
        <div className="col-xs-10">
          <Select
            multi={true}
            name="columns"
            value={this.props.value.get('columns', List()).toJS()}
            disabled={this.props.disabled || !this.props.value.get('source')}
            placeholder="All columns will be imported"
            onChange={this._handleChangeColumns}
            options={this._getColumnsOptions()}/>
          <div
            className="help-block">
            Import only specified columns
          </div>
        </div>
      </div>
    );
  },

  _handleChangeColumns(newValue) {
    const immutable = this.props.value.withMutations((initMapping) => {
      let mapping = initMapping.set('columns', newValue);
      if (!_.contains(mapping.get('columns').toJS(), mapping.get('where_column'))) {
        mapping = mapping.set('where_column', '');
        mapping = mapping.set('where_values', List());
        mapping = mapping.set('where_operator', 'eq');
      }
      return mapping;
    });
    return this.props.onChange(immutable);
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
  }
});
