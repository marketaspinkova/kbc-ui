import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import Immutable from 'immutable';
import { FormGroup, FormControl } from 'react-bootstrap';
import { Input } from '../../../../../react/common/KbcBootstrap';
import AutosuggestWrapper from './AutoSuggestWrapper';
import Select from '../../../../../react/common/Select';
import DestinationTableSelector from '../../../../../react/common/DestinationTableSelector';
import tableIdParser from '../../../../../utils/tableIdParser';
import stringUtils from '../../../../../utils/string';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    transformationBucket: React.PropTypes.object.isRequired,
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    backend: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired,
    definition: React.PropTypes.object,
    isNameAlreadyInUse: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return { definition: Immutable.Map() };
  },

  getInitialState() {
    return { overwriteDestination: false };
  },

  _parseDestination() {
    let bucketName = stringUtils.webalize(this.props.transformationBucket.get('name'));
    if (!bucketName.startsWith('c-')) {
      bucketName = `c-${bucketName}`;
    }
    const destination = this.props.value.get('destination');
    return tableIdParser.parse(destination, { defaultStage: 'out', defaultBucket: bucketName });
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
    const isFileMapping = this.props.backend === 'docker';
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
      value = value.set(
        'primaryKey',
        this.props.tables.getIn([value.get('destination'), 'primaryKey'], Immutable.List())
      );
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
        .set('deleteWhereColumn', '')
        .set('deleteWhereOperator', 'eq')
        .set('deleteWhereValues', Immutable.List());
    } else {
      value = this.props.value
        .delete('incremental')
        .delete('deleteWhereColumn')
        .delete('deleteWhereOperator')
        .delete('deleteWhereValues');
    }
    return this.props.onChange(value);
  },

  _handleChangePrimaryKey(newValue) {
    const value = this.props.value.set('primaryKey', newValue);
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereColumn(newValue) {
    const value = this.props.value.set('deleteWhereColumn', newValue.trim());
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereOperator(e) {
    const value = this.props.value.set('deleteWhereOperator', e.target.value);
    return this.props.onChange(value);
  },

  _handleChangeDeleteWhereValues(newValue) {
    const value = this.props.value.set('deleteWhereValues', newValue);
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
      return Immutable.List();
    }
    const { props } = this;
    const table = this.props.tables.find(t => t.get('id') === props.value.get('destination'));
    if (!table) {
      return Immutable.List();
    }
    return table.get('columns');
  },

  render() {
    return (
      <div className="form-horizontal clearfix">
        {!this.props.definition.has('source') && (
          <div className="row col-md-12">
            {this.props.backend === 'docker' ? (
              <Input
                type="text"
                name="source"
                label="File"
                autoFocus={true}
                value={this.props.value.get('source')}
                disabled={this.props.disabled}
                placeholder="File name"
                onFocus={this._handleFocusSource}
                onBlur={() => this.setState({ overwriteDestination: false })}
                onChange={this._handleChangeSource}
                labelClassName="col-xs-2"
                wrapperClassName="col-xs-10"
                help={
                  <span>
                    {'File will be uploaded from '}
                    <code>{`/data/out/tables/${this.props.value.get('source', '')}`}</code>.
                    {this.props.isNameAlreadyInUse && ' Filename already in use.'}
                  </span>
                }
              />
            ) : (
              <Input
                type="text"
                help="Name of a source table generated by running the transformation query script."
                name="source"
                label="Source"
                autoFocus={true}
                value={this.props.value.get('source')}
                disabled={this.props.disabled}
                placeholder="Source table in transformation DB"
                onFocus={this._handleFocusSource}
                onBlur={() => this.setState({ overwriteDestination: false })}
                onChange={this._handleChangeSource}
                labelClassName="col-xs-2"
                wrapperClassName="col-xs-10"
              />
            )}
          </div>
        )}
        <div className="row col-md-12">
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
                  'Storage table where the source table data will be loaded to - you can create a new table or use an existing one.'
                }
              />
            </div>
          </div>
        </div>
        <div className="row col-md-12">
          <div className="form-horizontal clearfix">
            <div className="form-group">
              <label className="control-label col-xs-2">
                <span />
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
                  help="If the destination table exists in Storage, output mapping does not overwrite the table, it only appends the data to it. Uses incremental write to Storage."
                />
              </div>
            </div>
            <div className="form-group">
              <label className="control-label col-xs-2">
                <span>Primary key</span>
              </label>
              <div className="col-xs-10">
                <Select
                  name="primaryKey"
                  value={this.props.value.get('primaryKey')}
                  multi={true}
                  trimMultiCreatedValues={true}
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
                    value={this.props.value.get('deleteWhereColumn', '')}
                    onChange={this._handleChangeDeleteWhereColumn}
                  />
                </div>
                <div className="col-xs-2">
                  <FormGroup className="no-bottom-margin">
                    <FormControl
                      componentClass="select"
                      name="deleteWhereOperator"
                      value={this.props.value.get('deleteWhereOperator')}
                      disabled={this.props.disabled}
                      onChange={this._handleChangeDeleteWhereOperator}
                    >
                      <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                      <option value={whereOperatorConstants.NOT_EQ_VALUE}>
                        {whereOperatorConstants.NOT_EQ_LABEL}
                      </option>
                    </FormControl>
                  </FormGroup>
                </div>
                <div className="col-xs-4">
                  <Select
                    name="deleteWhereValues"
                    value={this.props.value.get('deleteWhereValues')}
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
          </div>
        </div>
      </div>
    );
  }
});
