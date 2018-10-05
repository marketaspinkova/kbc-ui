import React from 'react';
import _ from 'underscore';
import { Map, List, fromJS } from 'immutable';
import { Input } from '../../../../../react/common/KbcBootstrap';
import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import RedshiftDataTypesContainer from './input/RedshiftDataTypesContainer';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
import { PanelWithDetails } from '@keboola/indigo-ui';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired,
    isDestinationDuplicate: React.PropTypes.bool.isRequired
  },

  distStyleOptions: [
    {
      label: 'EVEN',
      value: 'EVEN'
    },
    {
      label: 'KEY',
      value: 'KEY'
    },
    {
      label: 'ALL',
      value: 'ALL'
    }
  ],

  _handleChangeSource(value) {
    // use only table name from the table identifier
    let destination;
    if (value) {
      destination = value.substr(value.lastIndexOf('.') + 1);
    } else {
      destination = '';
    }
    const immutable = this.props.value.withMutations(mapping =>
      mapping
        .set('source', value)
        .set('destination', destination)
        .set('datatypes', Map())
        .set('whereColumn', '')
        .set('whereValues', List())
        .set('whereOperator', 'eq')
        .set('columns', List())
        .set('sortKey', '')
        .set('distKey', '')
    );
    return this.props.onChange(immutable);
  },

  _handleChangeDestination(e) {
    const value = this.props.value.set('destination', e.target.value.trim());
    return this.props.onChange(value);
  },

  _handleChangeOptional(e) {
    const value = this.props.value.set('optional', e.target.checked);
    return this.props.onChange(value);
  },

  _handleChangeChangedSince(changedSince) {
    let { value } = this.props;
    if (this.props.value.has('days')) {
      value = value.delete('days');
    }
    value = value.set('changedSince', changedSince);
    return this.props.onChange(value);
  },

  _handleChangeColumns(newValue) {
    const component = this;
    const immutable = this.props.value.withMutations(mapping => {
      mapping.set('columns', newValue);
      if (newValue.count()) {
        const columns = mapping.get('columns').toJS();
        if (!_.contains(columns, mapping.get('whereColumn'))) {
          mapping.set('whereColumn', '');
          mapping.set('whereValues', List());
          mapping.set('whereOperator', 'eq');
        }

        const datatypes = _.pick(mapping.get('datatypes').toJS(), columns);
        mapping.set('datatypes', fromJS(datatypes || Map()));

        if (!_.contains(columns, mapping.get('distKey'))) {
          mapping.set('distKey', '').set('distStyle', '');
        }

        mapping.set('sortKey', _.intersection(columns, component.props.value.get('sortKey').split(',')).join(','));
      }
    });

    return this.props.onChange(immutable);
  },

  _handleChangeWhereColumn(string) {
    const value = this.props.value.set('whereColumn', string);
    return this.props.onChange(value);
  },

  _handleChangeWhereOperator(e) {
    const value = this.props.value.set('whereOperator', e.target.value);
    return this.props.onChange(value);
  },

  _handleChangeWhereValues(newValue) {
    const value = this.props.value.set('whereValues', newValue);
    return this.props.onChange(value);
  },

  _handleChangeDataTypes(datatypes) {
    const value = this.props.value.set('datatypes', datatypes);
    return this.props.onChange(value);
  },

  _handleChangeSortKey(immutable) {
    const value = this.props.value.set('sortKey', immutable.join());
    return this.props.onChange(value);
  },

  _handleChangeDistKey(string) {
    const value = this.props.value.set('distKey', string);
    return this.props.onChange(value);
  },

  _handleChangeDistStyle(string) {
    let value = this.props.value.set('distStyle', string);
    if (string !== 'KEY') {
      value = value.set('distKey', '');
    }
    return this.props.onChange(value);
  },

  _getColumns() {
    if (!this.props.value.get('source')) {
      return [];
    }
    const { props } = this;
    const table = this.props.tables.find(t => t.get('id') === props.value.get('source'));
    if (!table) {
      return [];
    }
    return table.get('columns').toJS();
  },

  _getColumnsOptions() {
    const columns = this._getColumns();
    return _.map(columns, column => ({
      label: column,
      value: column
    }));
  },

  _getFilteredColumnsOptions() {
    let columns;
    if (this.props.value.get('columns', List()).count()) {
      columns = this.props.value.get('columns').toJS();
    } else {
      columns = this._getColumns();
    }
    return _.map(columns, column => ({
      label: column,
      value: column
    }));
  },

  _isSourceTableRedshift() {
    const { props } = this;
    const table = this.props.tables.find(t => t.get('id') === props.value.get('source'));
    if (!table) {
      return false;
    } else {
      return table.getIn(['bucket', 'backend']) === 'redshift';
    }
  },

  _getSortKeyImmutable() {
    if (this.props.value.get('sortKey')) {
      return fromJS(this.props.value.get('sortKey').split(','));
    } else {
      return List();
    }
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
                placeholder="Source table"
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
              this.props.isDestinationDuplicate ? (
                <span className="error">
                  {'Duplicate destination '}
                  <code>{this.props.value.get('destination')}</code>.
                </span>
              ) : null
            }
          />
        </div>
        <div className="row col-md-12">
          <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
            <div className="form-horizontal clearfix">
              <div className="form-group">
                <div className="col-xs-10 col-xs-offset-2">
                  <div className="checkbox">
                    <label>
                      <input
                        standalone={true}
                        type="checkbox"
                        checked={this.props.value.get('optional')}
                        disabled={this.props.disabled}
                        onChange={this._handleChangeOptional}
                      />
                      {' Optional'}
                    </label>
                    <span className="help-block">
                      If the source table does not exist in Storage, the transformation won't show an error.
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Columns</label>
                <div className="col-xs-10">
                  <Select
                    multi={true}
                    name="columns"
                    value={this.props.value.get('columns', List()).toJS()}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="All columns will be imported"
                    onChange={this._handleChangeColumns}
                    options={this._getColumnsOptions()}
                  />
                  <div className="help-block">Import only specified columns</div>
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Changed in last</label>
                <div className="col-xs-10">
                  <ChangedSinceInput
                    value={this.props.value.get(
                      'changedSince',
                      this.props.value.get('days') > 0 ? `-${this.props.value.get('days')} days` : null
                    )}
                    disabled={this.props.disabled || !this.props.value.get('source')}
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
                    delimiter=","
                    placeholder="Add a value..."
                    emptyStrings={true}
                    onChange={this._handleChangeWhereValues}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Data types</label>
                <div className="col-xs-10">
                  <RedshiftDataTypesContainer
                    value={this.props.value.get('datatypes', Map())}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    onChange={this._handleChangeDataTypes}
                    columnsOptions={this._getFilteredColumnsOptions()}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Sort key</label>
                <div className="col-xs-10">
                  <Select
                    multi={true}
                    name="sortKey"
                    value={this._getSortKeyImmutable()}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="No sortkey"
                    onChange={this._handleChangeSortKey}
                    options={this._getFilteredColumnsOptions()}
                  />
                  <div className="help-block">
                    SORTKEY option for creating table in Redshift DB. You can create a compound sort key.
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="col-xs-2 control-label">Distribution</label>
                <div className="col-xs-5">
                  <Select
                    name="distStyle"
                    value={this.props.value.get('distStyle')}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="Style"
                    onChange={this._handleChangeDistStyle}
                    options={this.distStyleOptions}
                  />
                </div>
                <div className="col-xs-5">
                  <Select
                    name="distKey"
                    value={this.props.value.get('distKey')}
                    disabled={
                      this.props.disabled ||
                      !this.props.value.get('source') ||
                      this.props.value.get('distStyle') !== 'KEY'
                    }
                    placeholder={
                      this.props.value.get('distStyle') === 'KEY' ? 'Select column' : 'Column selection not available'
                    }
                    onChange={this._handleChangeDistKey}
                    options={this._getFilteredColumnsOptions()}
                  />
                </div>
                <div className="col-xs-offset-2 col-xs-10 help-block">
                  DISTKEY and DISTSTYLE options used for CREATE TABLE query in Redshift.
                </div>
              </div>
            </div>
          </PanelWithDetails>
        </div>
      </div>
    );
  }
});
