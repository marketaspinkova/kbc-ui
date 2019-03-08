import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List, Map } from 'immutable';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Col, Checkbox, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import Select from '../../../../../react/common/Select';
import AutosuggestWrapper from '../../../../transformations/react/components/mapping/AutoSuggestWrapper';
import DestinationTableSelector from '../../../../../react/common/DestinationTableSelector';
import tableIdParser from '../../../../../utils/tableIdParser';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import stringUtils from '../../../../../utils/string';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

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
          <FormGroup>
            <Col xs={2} componentClass={ControlLabel}>
              File
            </Col>
            <Col xs={10}>
              <FormControl
                type="text"
                autoFocus
                value={this.props.value.get('source')}
                disabled={this.props.disabled}
                placeholder="File name"
                onFocus={this._handleFocusSource}
                onBlur={() => this.setState({overwriteDestination: false})}
                onChange={this._handleChangeSource}
              />
              <HelpBlock>
                File will be uploaded from <code>{`/data/out/tables/${this.props.value.get('source', '')}`}</code>
              </HelpBlock>
            </Col>
          </FormGroup>
        )}
        <FormGroup>
          <Col xs={2} componentClass={ControlLabel}>Destination</Col>
          <Col xs={10}>
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
          </Col>
        </FormGroup>
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <FormGroup>
            <Col xs={10} xsOffset={2}>
              <Checkbox
                checked={this.props.value.get('incremental')}
                disabled={this.props.disabled}
                onChange={this._handleChangeIncremental}
              >
                Incremental
              </Checkbox>
              <HelpBlock>
                If the destination table exists in Storage, output mapping does not overwrite the table, it only appends the data to it. Uses incremental write to Storage.
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={2} componentClass={ControlLabel}>
              Primary key
            </Col>
            <Col xs={10}>
              <Select
                name="primary_key"
                value={this.props.value.get('primary_key')}
                multi
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
            </Col>
          </FormGroup>
          {(this.props.value.get('incremental') || this.props.value.get('deleteWhereColumn', '') !== '') && (
            <FormGroup>
              <Col xs={2} componentClass={ControlLabel}>
                Delete rows
              </Col>
              <Col xs={4}>
                <AutosuggestWrapper
                  suggestions={this._getColumns()}
                  placeholder="Select column"
                  value={this.props.value.get('delete_where_column', '')}
                  onChange={this._handleChangeDeleteWhereColumn}
                />
              </Col>
              <Col xs={2}>
                <FormControl
                  componentClass="select"
                  value={this.props.value.get('delete_where_operator')}
                  disabled={this.props.disabled}
                  onChange={this._handleChangeDeleteWhereOperator}
                >
                  <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                  <option value={whereOperatorConstants.NOT_EQ_VALUE}>
                    {whereOperatorConstants.NOT_EQ_LABEL}
                  </option>
                </FormControl>
              </Col>
              <Col xs={4}>
                <Select
                  name="deleteWhereValues"
                  value={this.props.value.get('delete_where_values')}
                  multi
                  disabled={this.props.disabled}
                  allowCreate
                  delimiter=","
                  placeholder="Add a value..."
                  emptyStrings
                  onChange={this._handleChangeDeleteWhereValues}
                />
              </Col>
              <Col xs={10} xsOffset={2}>
                <HelpBlock className="bottom-margin">
                  Delete matching rows in the destination table before importing the result
                </HelpBlock>
              </Col>
            </FormGroup>
          )}
        </PanelWithDetails>
      </div>
    );
  }
});
