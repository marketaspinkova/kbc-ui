import React from 'react';
import _ from 'underscore';

import Immutable from 'immutable';
import {Input} from './../../../../../react/common/KbcBootstrap';

import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import SnowflakeDataTypesContainer from './input/SnowflakeDataTypesContainer';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import {PanelWithDetails} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired,
    isDestinationDuplicate: React.PropTypes.bool.isRequired
  },

  _handleChangeSource(value) {
    // use only table name from the table identifier
    const destination = value ? value.substr(value.lastIndexOf('.') + 1) : '';
    const mutatedValue = this.props.value.withMutations((mapping) => {
      let mutation = mapping.set('source', value);
      mutation = mutation.set('destination', destination);
      mutation = mutation.set('datatypes', Immutable.Map());
      mutation = mutation.set('whereColumn', '');
      mutation = mutation.set('whereValues', Immutable.List());
      mutation = mutation.set('whereOperator', 'eq');
      return mutation.set('columns', Immutable.List());
    });
    return this.props.onChange(mutatedValue);
  },

  _handleChangeDestination(e) {
    return this.props.onChange(this.props.value.set('destination', e.target.value.trim()));
  },

  _handleChangeChangedSince(changedSince) {
    let value = this.props.value;
    if (this.props.value.has('days')) {
      value = value.delete('days');
    }
    value = value.set('changedSince', changedSince);
    return this.props.onChange(value);
  },

  _handleChangeColumns(newValue) {
    const mutatedValue = this.props.value.withMutations((mapping) => {
      let mutation = mapping.set('columns', newValue);
      if (newValue.count()) {
        let columns = mutation.get('columns').toJS();
        if (!_.contains(columns, mutation.get('whereColumn'))) {
          mutation = mutation.set('whereColumn', '');
          mutation = mutation.set('whereValues', Immutable.List());
          mutation = mutation.set('whereOperator', 'eq');
        }
        let datatypes = _.pick(mutation.get('datatypes').toJS(), columns);
        mutation = mutation.set('datatypes', Immutable.fromJS(datatypes || Immutable.Map()));
      }
      return mutation;
    });
    return this.props.onChange(mutatedValue);
  },

  _handleChangeWhereColumn(string) {
    return this.props.onChange(this.props.value.set('whereColumn', string));
  },

  _handleChangeWhereOperator(e) {
    return this.props.onChange(this.props.value.set('whereOperator', e.target.value));
  },
  _handleChangeWhereValues(newValue) {
    return this.props.onChange(this.props.value.set('whereValues', newValue));
  },

  _handleChangeDataTypes(datatypes) {
    return this.props.onChange(this.props.value.set('datatypes', datatypes));
  },

  _getColumns() {
    if (!this.props.value.get('source')) {
      return [];
    }
    const selectedTable = this.props.tables.find((table) => {
      return table.get('id') === this.props.value.get('source');
    });
    if (selectedTable) {
      return selectedTable.get('columns').toJS();
    }
    return [];
  },

  _getColumnsOptions() {
    const columns = this._getColumns();
    return _.map(columns, (column) => {
      return {
        label: column,
        value: column
      };
    });
  },

  _getFilteredColumnsOptions() {
    const columns = this.props.value.get('columns', Immutable.List()).count() > 0
      ? this.props.value.get('columns').toJS()
      : this._getColumns();
    return _.map(columns, (column) => {
      return {
        label: column,
        value: column
      };
    });
  },

  getChangedSinceValue() {
    if (this.props.value.get('changedSince')) {
      return this.props.value.get('changedSince');
    } else if (this.props.value.get('days') > 0) {
      return '-' + this.props.value.get('days') + ' days';
    }
    return null;
  },

  render() {
    return (
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <div className="form-group">
            <label className="col-xs-2 control-label">Source</label>
            <div className="col-xs-10">
              <SapiTableSelector
                value={this.props.value.get('source', '')}
                disabled={this.props.disabled}
                placeholder="Source Table"
                onSelectTableFn={this._handleChangeSource}
                autoFocus={true}
              />
            </div>
          </div>
        </div>
        <div className="row col-md-12">
          <Input
            type="text"
            label="Destination"
            value={this.props.value.get('destination')}
            disabled={this.props.disabled}
            placeholder="Destination table name in transformation DB"
            onChange={this._handleChangeDestination}
            labelClassName="col-xs-2"
            wrapperClassName="col-xs-10"
            bsStyle={this.props.isDestinationDuplicate ? 'error' : null}
            help={
              this.props.isDestinationDuplicate
                ? <span className="error">
                      Duplicate Destination <code>{this.props.value.get('destination')}</code>.
                </span>
                : null
            }
          />
        </div>
        <div className="row col-md-12">
          <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
            <div className="form-horizontal clearfix">
              <div className="form-group">
                <label className="col-xs-2 control-label">Columns</label>
                <div className="col-xs-10">
                  <Select
                    multi={true}
                    name="columns"
                    value={this.props.value.get('columns', Immutable.List()).toJS()}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="All columns will be imported"
                    onChange={this._handleChangeColumns}
                    options={this._getColumnsOptions()}
                  />
                  <div className="help-block">
                    Import only specified columns
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Changed in last</label>
                <div className="col-xs-10">
                  <ChangedSinceInput
                    value={this.getChangedSinceValue()}
                    disabled={this.props.disabled}
                    onChange={this._handleChangeChangedSince}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Data filter</label>
                <div className="col-xs-4">
                  <Select
                    name="whereColumn"
                    value={this.props.value.get('whereColumn')}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="Select column"
                    onChange={this._handleChangeWhereColumn}
                    options={this._getColumnsOptions()}
                  />
                </div>
                <div className="col-xs-2">
                  <Input
                    type="select"
                    name="whereOperator"
                    value={this.props.value.get('whereOperator')}
                    disabled={this.props.disabled}
                    onChange={this._handleChangeWhereOperator}
                  >
                    <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                    <option value={whereOperatorConstants.NOT_EQ_VALUE}>{whereOperatorConstants.NOT_EQ_LABEL}</option>
                  </Input>
                </div>
                <div className="col-xs-4">
                  <Select
                    name="whereValues"
                    value={this.props.value.get('whereValues')}
                    multi={true}
                    disabled={this.props.disabled}
                    allowCreate={true}
                    placeholder="Add a value..."
                    emptyStrings={true}
                    onChange={this._handleChangeWhereValues}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Data types</label>
                <div className="col-xs-10">
                  <SnowflakeDataTypesContainer
                    value={this.props.value.get('datatypes', Immutable.Map())}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    onChange={this._handleChangeDataTypes}
                    columnsOptions={this._getFilteredColumnsOptions()}
                  />
                </div>
              </div>
            </div>
          </PanelWithDetails>
        </div>
      </div>
    );
  }
});
