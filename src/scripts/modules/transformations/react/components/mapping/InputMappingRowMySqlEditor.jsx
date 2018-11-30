import React from 'react';
import _ from 'underscore';
import { List, Map, fromJS } from 'immutable';
import { Input } from '../../../../../react/common/KbcBootstrap';
import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import MySqlIndexesContainer from './input/MySqlIndexesContainer';
import MySqlDataTypesContainer from './input/MySqlDataTypesContainer';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
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

  getInitialState() {
    return { showDetails: this.props.initialShowDetails };
  },

  shouldComponentUpdate(nextProps, nextState) {
    const should =
      this.props.value !== nextProps.value ||
      this.props.tables !== nextProps.tables ||
      this.props.disabled !== nextProps.disabled ||
      this.state.showDetails !== nextState.showDetails;

    return should;
  },

  _handleToggleShowDetails(e) {
    return this.setState({
      showDetails: e.target.checked
    });
  },

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
        .set('indexes', List())
        .set('datatypes', Map())
        .set('whereColumn', '')
        .set('whereValues', List())
        .set('whereOperator', 'eq')
        .set('columns', List())
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
    const immutable = this.props.value.withMutations(mapping => {
      mapping.set('columns', newValue);
      if (!_.contains(mapping.get('columns').toJS(), mapping.get('whereColumn'))) {
        mapping
          .set('whereColumn', '')
          .set('whereValues', List())
          .set('whereOperator', 'eq');
      }

      const datatypes = _.pick(mapping.get('datatypes').toJS(), mapping.get('columns').toJS());
      mapping.set('datatypes', fromJS(datatypes || Map()));

      const indexes = _.filter(
        mapping.get('indexes').toJS(),
        index =>
          _.filter(index, indexPart => _.contains(mapping.get('columns').toJS(), indexPart)).length === index.length
      );
      mapping.set('indexes', fromJS(indexes || List()));
    });

    return this.props.onChange(immutable);
  },

  _handleChangeIndexes(indexes) {
    const value = this.props.value.set('indexes', indexes);
    return this.props.onChange(value);
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

  render() {
    return (
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <div className="form-group">
            <div className="col-xs-10 col-xs-offset-2">
              <Input
                standalone={true}
                type="checkbox"
                label="Show details"
                checked={this.state.showDetails}
                onChange={this._handleToggleShowDetails}
              />
            </div>
          </div>
        </div>
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
              {this.state.showDetails && (
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
                    If this table does not exist in Storage, the transformation won't show an error.
                  </span>
                </div>
              )}
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
        {this.state.showDetails && (
          <div className="row col-md-12">
            <div className="form-group">
              <label className="col-xs-2 control-label">Columns</label>
              <div className="col-xs-10">
                <Select
                  multi={true}
                  name="columns"
                  value={this.props.value.get('columns', List())}
                  disabled={this.props.disabled || !this.props.value.get('source')}
                  placeholder="All columns will be imported"
                  onChange={this._handleChangeColumns}
                  options={this._getColumnsOptions()}
                />
                <div className="help-block">Import only specified columns</div>
              </div>
            </div>
          </div>
        )}
        {this.state.showDetails && (
          <div className="row col-md-12">
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
          </div>
        )}
        {this.state.showDetails && (
          <div className="row col-md-12">
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
          </div>
        )}
        {this.state.showDetails && (
          <div className="row col-md-12">
            <div className="form-group">
              <label className="col-xs-2 control-label">Indexes</label>
              <div className="col-xs-10">
                <MySqlIndexesContainer
                  value={this.props.value.get('indexes', List())}
                  disabled={this.props.disabled || !this.props.value.get('source')}
                  onChange={this._handleChangeIndexes}
                  columnsOptions={this._getFilteredColumnsOptions()}
                />
              </div>
            </div>
          </div>
        )}
        {this.state.showDetails && (
          <div className="row col-md-12">
            <div className="form-group">
              <label className="col-xs-2 control-label">Data types</label>
              <div className="col-xs-10">
                <MySqlDataTypesContainer
                  value={this.props.value.get('datatypes', Map())}
                  disabled={this.props.disabled || !this.props.value.get('source')}
                  onChange={this._handleChangeDataTypes}
                  columnsOptions={this._getFilteredColumnsOptions()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
