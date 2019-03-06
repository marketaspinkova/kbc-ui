import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { List, Map } from 'immutable';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Input } from '../../../../../react/common/KbcBootstrap';
import Select from '../../../../../react/common/Select';
import AutosuggestWrapper from '../../../../transformations/react/components/mapping/AutoSuggestWrapper';
import DestinationTableSelector from '../../../../../react/common/DestinationTableSelector';
import tableIdParser from '../../../../../utils/tableIdParser';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import stringUtils from '../../../../../utils/string';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    backend: React.PropTypes.string.isRequired,
    definition: React.PropTypes.object,
    initialShowDetails: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return { definition: Map() };
  },

  getInitialState() {
    return { overwriteDestination: false };
  },

  _parseDestination() {
    const destination = this.props.value.get('destination');
    return tableIdParser.parse(destination, { defaultStage: 'out' });
  },

  _handleFocusSource() {
    if (!this._parseDestination().parts.table) {
      return this.setState({ overwriteDestination: true });
    }
  },

  prepareDestinationFromSource(value) {
    let sourceValue = value;
    if (!this.state.overwriteDestination) {
      return null;
    }
    const isFileMapping = true; // generic components always use file system
    const lastDotIdx = sourceValue.lastIndexOf('.');
    if (isFileMapping && lastDotIdx > 0) {
      sourceValue = sourceValue.substring(0, lastDotIdx);
    }
    const dstParser = this._parseDestination();
    const webalizedSourceValue = stringUtils.webalize(sourceValue, { caseSensitive: true });
    const newDestination = dstParser.setPart('table', webalizedSourceValue);
    return newDestination.tableId;
  },

  _handleChangeSource(e) {
    const newSource = e.target.value.trim();
    const newDestination = this.prepareDestinationFromSource(newSource);
    let newMapping = this.props.value;
    if (newDestination) {
      newMapping = this.updateMappingWithDestination(newDestination);
    }
    newMapping = newMapping.set('source', newSource);
    return this.props.onChange(newMapping);
  },

  updateMappingWithDestination(newDestination) {
    let value = this.props.value.set('destination', newDestination.trim());
    if (this.props.tables.get(value.get('destination'))) {
      value = value.set('primary_key', this.props.tables.getIn([value.get('destination'), 'primaryKey'], List()));
    }
    return value;
  },

  _handleChangeDestination(newValue) {
    return this.props.onChange(this.updateMappingWithDestination(newValue));
  },

  _updateDestinationPart(partName, value) {
    return this._handleChangeDestination(this._parseDestination().setPart(partName, value).tableId);
  },

  _handleChangeIncremental(e) {
    let value;
    if (e.target.checked) {
      value = this.props.value
        .set('incremental', e.target.checked)
        .set('delete_where_column', '')
        .set('delete_where_operator', 'eq')
        .set('delete_where_values', List());
    } else {
      value = this.props.value
        .delete('incremental')
        .delete('delete_where_column')
        .delete('delete_where_operator')
        .delete('delete_where_values');
    }
    return this.props.onChange(value);
  },

  _handleChangePrimaryKey(newValue) {
    const value = this.props.value.set('primary_key', newValue);
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereColumn(newValue) {
    const value = this.props.value.set('delete_where_column', newValue.trim());
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereOperator(e) {
    const value = this.props.value.set('delete_where_operator', e.target.value);
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereValues(newValue) {
    const value = this.props.value.set('delete_where_values', newValue);
    return this.props.onChange(value);
  },

  _getTablesAndBuckets() {
    const tablesAndBuckets = this.props.tables.merge(this.props.buckets);

    const inOut = tablesAndBuckets.filter(
      item => item.get('id').substr(0, 3) === 'in.' || item.get('id').substr(0, 4) === 'out.'
    );

    const map = inOut.sortBy(item => item.get('id')).map(item => item.get('id'));

    return map.toList();
  },

  _getColumns() {
    if (!this.props.value.get('destination')) {
      return List();
    }
    const { props } = this;
    const table = this.props.tables.find(item => item.get('id') === props.value.get('destination'));
    if (!table) {
      return List();
    }
    return table.get('columns');
  },

  render() {
    return (
      <div className="form-horizontal">
        {!this.props.definition.has('source') && (
          <Input
            type="text"
            name="source"
            label="File"
            value={this.props.value.get('source')}
            disabled={this.props.disabled}
            placeholder="File name"
            onFocus={this._handleFocusSource}
            onBlur={() => this.setState({overwriteDestination: false})}
            onChange={this._handleChangeSource}
            labelClassName="col-xs-2"
            wrapperClassName="col-xs-10"
            autoFocus={true}
            help={
              <span>
                {'File will be uploaded from'}
                <code>{`/data/out/tables/${this.props.value.get('source', '')}`}</code>
              </span>
            }
          />
        )}
        <div className="form-group">
          <label className="col-xs-2 control-label">Destination</label>
          <div className="col-xs-10">
            <DestinationTableSelector
              currentSource={this.props.value.get('source')}
              updatePart={this._updateDestinationPart}
              disabled={false}
              parts={this._parseDestination().parts}
              tables={this.props.tables}
              buckets={this.props.buckets}
              placeholder={
                'Storage table where \
the source file data will be loaded to - you can create a new table or use an existing one.'
              }
            />
          </div>
        </div>
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <div className="form-group">
            <label className="control-label col-xs-2">
              <span/>
            </label>
            <div className="col-xs-10">
              <Input
                standalone={true}
                name="incremental"
                type="checkbox"
                label="Incremental"
                checked={this.props.value.get('incremental')}
                disabled={this.props.disabled}
                onChange={this._handleChangeIncremental}
                help={
                  'If the destination table exists in Storage, output mapping does not overwrite the table, it only appends the data to it. Uses incremental write to Storage.'
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="control-label col-xs-2">
              <span>Primary key</span>
            </label>
            <div className="col-xs-10">
              <Select
                name="primary_key"
                value={this.props.value.get('primary_key')}
                multi={true}
                disabled={this.props.disabled}
                allowCreate={this._getColumns().size === 0}
                delimiter=","
                placeholder="Add a column to primary key..."
                emptyStrings={false}
                noResultsText="No matching column found"
                help="Primary key of the table in Storage. If the table already exists, primary key must match."
                onChange={this._handleChangePrimaryKey}
                options={this._getColumns()
                  .map(option => ({
                    label: option,
                    value: option
                  }))
                  .toJS()}
              />
            </div>
          </div>
          {(this.props.value.get('incremental') || this.props.value.get('deleteWhereColumn', '') !== '') && (
            <div className="form-group">
              <label className="col-xs-2 control-label">Delete rows</label>
              <div className="col-xs-4">
                <AutosuggestWrapper
                  suggestions={this._getColumns()}
                  placeholder="Select column"
                  value={this.props.value.get('delete_where_column', '')}
                  onChange={this._handleChangeDeleteWhereColumn}
                />
              </div>
              <div className="col-xs-2">
                <Input
                  type="select"
                  name="deleteWhereOperator"
                  value={this.props.value.get('delete_where_operator')}
                  disabled={this.props.disabled}
                  onChange={this._handleChangeDeleteWhereOperator}
                >
                  <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                  <option value={whereOperatorConstants.NOT_EQ_VALUE}>
                    {whereOperatorConstants.NOT_EQ_LABEL}
                  </option>
                </Input>
              </div>
              <div className="col-xs-4">
                <Select
                  name="deleteWhereValues"
                  value={this.props.value.get('delete_where_values')}
                  multi={true}
                  disabled={this.props.disabled}
                  allowCreate={true}
                  delimiter=","
                  placeholder="Add a value..."
                  emptyStrings={true}
                  onChange={this._handleChangeDeleteWhereValues}
                />
              </div>
              <div className="col-xs-10 col-xs-offset-2 help-block bottom-margin">
                Delete matching rows in the destination table before importing the result
              </div>
            </div>
          )}
        </PanelWithDetails>
      </div>
    );
  }
});
