import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import Immutable from 'immutable';
import { Form, FormGroup, FormControl, ControlLabel, Col, HelpBlock, Checkbox } from 'react-bootstrap';
import AutosuggestWrapper from './AutoSuggestWrapper';
import Select from '../../../../../react/common/Select';
import DestinationTableSelector from '../../../../../react/common/DestinationTableSelector';
import tableIdParser from '../../../../../utils/tableIdParser';
import stringUtils from '../../../../../utils/string';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    transformationBucket: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    backend: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    initialShowDetails: PropTypes.bool.isRequired,
    definition: PropTypes.object,
    isNameAlreadyInUse: PropTypes.bool.isRequired
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
      <Form horizontal>
        {!this.props.definition.has('source') && (
          <span>
            {this.props.backend === 'docker' ? (
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>File</Col>
                <Col xs={10}>
                  <FormControl
                    autoFocus
                    type="text"
                    name="source"
                    value={this.props.value.get('source')}
                    disabled={this.props.disabled}
                    placeholder="File name"
                    onFocus={this._handleFocusSource}
                    onBlur={() => this.setState({ overwriteDestination: false })}
                    onChange={this._handleChangeSource}
                  />
                  <HelpBlock>
                    {'File will be uploaded from '}
                    <code>{`/data/out/tables/${this.props.value.get('source', '')}`}</code>.
                    {this.props.isNameAlreadyInUse && ' Filename already in use.'}
                  </HelpBlock>
                </Col>
              </FormGroup>
            ) : (
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>Source</Col>
                <Col xs={10}>
                  <FormControl
                    type="text"
                    name="source"
                    autoFocus
                    value={this.props.value.get('source')}
                    disabled={this.props.disabled}
                    placeholder="Source table in transformation DB"
                    onFocus={this._handleFocusSource}
                    onBlur={() => this.setState({ overwriteDestination: false })}
                    onChange={this._handleChangeSource}
                  />
                  <HelpBlock>
                    Name of a source table generated by running the transformation query script.
                  </HelpBlock>
                </Col>
              </FormGroup>
            )}
          </span>
        )}

        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>
            Destination
          </Col>
          <Col sm={10}>
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
          </Col>
        </FormGroup>

        <FormGroup className="form-group">
          <Col sm={10} smOffset={2}>
            <Checkbox
              name="incremental"
              checked={this.props.value.get('incremental')}
              disabled={this.props.disabled}
              onChange={this._handleChangeIncremental}
            >
              Incremental
            </Checkbox>
            <HelpBlock>
              If the destination table exists in Storage, output mapping does not overwrite the table,
              {' '}it only appends the data to it. Uses incremental write to Storage.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>
            Primary key
          </Col>
          <Col sm={10}>
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
          </Col>
        </FormGroup>
        {(this.props.value.get('incremental') || this.props.value.get('deleteWhereColumn', '') !== '') && (
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>
              Delete rows
            </Col>
            <Col sm={4}>
              <AutosuggestWrapper
                suggestions={this._getColumns()}
                placeholder="Select column"
                value={this.props.value.get('deleteWhereColumn', '')}
                onChange={this._handleChangeDeleteWhereColumn}
              />
            </Col>
            <Col sm={2}>
              <FormControl
                componentClass="select"
                name="deleteWhereOperator"
                value={this.props.value.get('deleteWhereOperator')}
                disabled={this.props.disabled}
                onChange={this._handleChangeDeleteWhereOperator}
              >
                <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                <option value={whereOperatorConstants.NOT_EQ_VALUE}>{whereOperatorConstants.NOT_EQ_LABEL}</option>
              </FormControl>
            </Col>
            <Col sm={4}>
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
            </Col>
            <Col sm={10} smOffset={2}>
              <HelpBlock>Delete matching rows in the destination table before importing the result</HelpBlock>
            </Col>
          </FormGroup>
        )}
      </Form>
    );
  }
});
