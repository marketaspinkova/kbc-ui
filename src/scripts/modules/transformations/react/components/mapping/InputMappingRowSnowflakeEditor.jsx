import React from 'react';
import _ from 'underscore';
import { fromJS, Map, List } from 'immutable';
import { Form, FormGroup, FormControl, ControlLabel, Col, HelpBlock } from 'react-bootstrap';
import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import DatatypeForm from './input/DatatypeForm';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import {PanelWithDetails} from '@keboola/indigo-ui';
import MetadataStore from '../../../../components/stores/MetadataStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { SnowflakeDataTypesMapping } from '../../../Constants';
import { getMetadataDataTypes } from './InputMappingRowSnowflakeEditorHelper';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired,
    isDestinationDuplicate: React.PropTypes.bool.isRequired
  },

  mixins: [createStoreMixin(MetadataStore)],

  getStateFromStores() {
    const source = this.props.value.get('source');
    return {
      hasMetadataDatatypes: source ? MetadataStore.tableHasMetadataDatatypes(source) : false,
      tableColumnMetadata: source ? MetadataStore.getTableColumnsMetadata(source) : Map()
    };
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value.has('source')
      && nextProps.value.get('source') !== this.props.value.get('source')
      && nextProps.value.get('source') !== ''
    ) {
      this.setState({
        hasMetadataDatatypes: MetadataStore.tableHasMetadataDatatypes(nextProps.value.get('source')),
        tableColumnMetadata: MetadataStore.getTableColumnsMetadata(nextProps.value.get('source'))
      });
    }
  },

  _handleChangeSource(value) {
    // use only table name from the table identifier
    const destination = value ? value.substr(value.lastIndexOf('.') + 1) : '';
    const mutatedValue = this.props.value.withMutations((mapping) => {
      mapping.set('source', value);
      mapping.set('destination', destination);
      mapping.set('datatypes', this.getInitialDatatypes(value));
      mapping.set('whereColumn', '');
      mapping.delete('loadType');
      mapping.set('whereValues', List());
      mapping.set('whereOperator', 'eq');
      mapping.set('columns', List());
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

  canCloneTable() {
    const table = this.getSelectedTable() || Map();
    const isSnowflake = table.getIn(['bucket', 'backend']) === 'snowflake';
    const isAliased = table.get('isAlias', false);
    const isFiltered = table.get('aliasFilter', Map()).count() > 0;
    const isSynced = table.get('aliasColumnsAutoSync', false);
    const isAliasClonable = isAliased ? isSynced && !isFiltered : true;
    return isSnowflake && isAliasClonable;
  },

  handleChangeLoadType(newValue) {
    const newMapping = this.props.value.withMutations(mapping => {
      if (newValue && newValue !== '') {
        mapping.set('loadType', newValue);
      } else {
        mapping.delete('loadType');
      }
      mapping.set('whereColumn', '');
      mapping.set('whereValues', List());
      mapping.set('whereOperator', 'eq');
      mapping.set('columns', List());
      mapping.set('datatypes', Map());
    });
    return this.props.onChange(newMapping);
  },

  _handleChangeColumns(newValue) {
    const mutatedValue = this.props.value.withMutations((mapping) => {
      let mutation = mapping.set('columns', newValue);
      const initialDatatypes = this.getInitialDatatypes(mapping.get('source'));
      if (newValue.count()) {
        const columns = mutation.get('columns');
        if (!_.contains(columns.toJS(), mutation.get('whereColumn'))) {
          mutation = mutation.set('whereColumn', '');
          mutation = mutation.set('whereValues', List());
          mutation = mutation.set('whereOperator', 'eq');
        }
        const currentDatatypes = this.getDatatypes();
        let newDatatypes = Map();
        columns.forEach((column) => {
          if (currentDatatypes.has(column)) {
            newDatatypes = newDatatypes.set(column, currentDatatypes.get(column));
          } else {
            newDatatypes = newDatatypes.set(column, initialDatatypes.get(column));
          }
        });
        mutation = mutation.set('datatypes', fromJS(newDatatypes || Map()));
      } else {
        mutation = mutation.set('datatypes', fromJS(initialDatatypes || Map()));
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

  getSelectedTable() {
    if (!this.props.value.get('source')) {
      return Map();
    }
    return this.props.tables.find((table) => {
      return table.get('id') === this.props.value.get('source');
    }, null, Map());
  },

  _getColumns() {
    return this.getSelectedTable() ? this.getSelectedTable().get('columns', List()) : List();
  },

  isPrimaryKeyColumn(column) {
    return this.getSelectedTable().get('primaryKey', List()).has(column);
  },

  _getColumnsOptions() {
    return this._getColumns().map((column) => {
      return {
        label: column,
        value: column
      };
    }).toJS();
  },

  _getFilteredColumns() {
    return this.props.value.get('columns', List()).count() > 0
      ? this.props.value.get('columns')
      : this._getColumns();
  },

  _getFilteredColumnsOptions() {
    return this._getFilteredColumns().map((column) => {
      return {
        label: column,
        value: column
      };
    }).toJS();
  },

  getChangedSinceValue() {
    if (this.props.value.get('changedSince')) {
      return this.props.value.get('changedSince');
    } else if (this.props.value.get('days') > 0) {
      return '-' + this.props.value.get('days') + ' days';
    }
    return null;
  },

  getDefaultDatatypes() {
    const filteredColumns = this._getFilteredColumns();

    if (this.state.hasMetadataDatatypes) {
      const metadataSet = this.state.tableColumnMetadata.filter((metadata, colname) => {
        return filteredColumns.indexOf(colname) > -1;
      });
      return this.buildDatatypes(filteredColumns, getMetadataDataTypes(metadataSet));
    }

    return this.buildDatatypes(filteredColumns);
  },

  getDefaultDatatype(column) {
    return fromJS({
      column: column,
      type: 'VARCHAR',
      length: this.isPrimaryKeyColumn(column) ? 255 : null,
      convertEmptyValuesToNull: false
    });
  },

  getInitialDatatypes(sourceTable) {
    const selectedTable = this.props.tables.find(table => table.get('id') === sourceTable);
    if (!selectedTable) {
      return Map();
    }

    if (MetadataStore.tableHasMetadataDatatypes(sourceTable)) {
      const datatypes = getMetadataDataTypes(MetadataStore.getTableColumnsMetadata(sourceTable));
      return this.buildDatatypes(selectedTable.get('columns'), datatypes);
    }

    return this.buildDatatypes(selectedTable.get('columns'));
  },

  buildDatatypes(columns, datatypes = Map()) {
    return columns.reduce((memo, column) => {
      if (!datatypes.get(column)) {
        return memo.set(column, this.getDefaultDatatype(column));
      }
      return memo.set(column, datatypes.get(column));
    }, Map());
  },

  getDatatypes() {
    return this.getDefaultDatatypes().map((defaultType) => {
      const existingTypeFilter = this.props.value.get('datatypes', Map()).filter((existingType, columnName) => {
        const column = Map.isMap(existingType) ? existingType.get('column') : columnName;
        return column === defaultType.get('column');
      });
      if (existingTypeFilter.count() > 0) {
        return existingTypeFilter.get(defaultType.get('column'));
      } else {
        return defaultType;
      }
    });
  },

  render() {
    const isCloneTable = this.props.value.get('loadType') === 'clone';
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>Source</Col>
          <Col sm={10}>
            <SapiTableSelector
              value={this.props.value.get('source', '')}
              disabled={this.props.disabled}
              placeholder="Source Table"
              onSelectTableFn={this._handleChangeSource}
              autoFocus={true}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>Destination</Col>
          <Col sm={10}>
            <FormControl
              type="text"
              value={this.props.value.get('destination')}
              disabled={this.props.disabled}
              placeholder="Destination table name in transformation DB"
              onChange={this._handleChangeDestination}
              bsStyle={this.props.isDestinationDuplicate ? 'error' : null}
            />
            {this.props.isDestinationDuplicate && (
              <HelpBlock>
                Duplicate Destination <code>{this.props.value.get('destination')}</code>.
              </HelpBlock>
            )}
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>Load Type</Col>
          <Col sm={10}>
            <Select
              name="loadType"
              searchable={false}
              value={this.props.value.get('loadType', '')}
              disabled={this.props.disabled || !this.props.value.get('source')}
              placeholder="Copy Table (default)"
              clearable={false}
              onChange={this.handleChangeLoadType}
              options={[
                {label: 'Copy Table (default)', value: ''},
                {label: 'Clone Table', value: 'clone', disabled: !this.canCloneTable()}
              ]}
            />
            <HelpBlock>
              Type of table load from Storage into a Workspace. <code>Clone</code> load type can be applied only on Snowflake tables without any filtering parameters.
            </HelpBlock>
          </Col>
        </FormGroup>
        {!isCloneTable && (
          <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
            <div>
              <FormGroup>
                <Col sm={2} componentClass={ControlLabel}>Columns</Col>
                <Col sm={10}>
                  <Select
                    multi={true}
                    name="columns"
                    value={this.props.value.get('columns', List()).toJS()}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="All columns will be imported"
                    onChange={this._handleChangeColumns}
                    options={this._getColumnsOptions()}
                  />
                  <HelpBlock>
                    Import only specified columns
                  </HelpBlock>
                </Col>
              </FormGroup>
              <FormGroup>
                <Col sm={2} componentClass={ControlLabel}>Changed in last</Col>
                <Col sm={10}>
                  <ChangedSinceInput
                    value={this.getChangedSinceValue()}
                    disabled={this.props.disabled}
                    onChange={this._handleChangeChangedSince}
                  />
                </Col>
              </FormGroup>
              <FormGroup>
                <Col sm={2} componentClass={ControlLabel}>Data filter</Col>
                <Col sm={4}>
                  <Select
                    name="whereColumn"
                    value={this.props.value.get('whereColumn')}
                    disabled={this.props.disabled || !this.props.value.get('source')}
                    placeholder="Select column"
                    onChange={this._handleChangeWhereColumn}
                    options={this._getColumnsOptions()}
                  />
                </Col>
                <Col sm={2}>
                  <FormControl
                    name="whereOperator"
                    componentClass="select"
                    value={this.props.value.get('whereOperator')}
                    disabled={this.props.disabled}
                    onChange={this._handleChangeWhereOperator}
                  >
                    <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                    <option value={whereOperatorConstants.NOT_EQ_VALUE}>{whereOperatorConstants.NOT_EQ_LABEL}</option>
                  </FormControl>
                </Col>
                <Col sm={4}>
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
                </Col>
              </FormGroup>
              <ControlLabel>Data types</ControlLabel>
              <DatatypeForm
                datatypes={this.getDatatypes()}
                columns={this._getFilteredColumns()}
                datatypesMap={SnowflakeDataTypesMapping}
                disabled={this.props.disabled || !this.props.value.get('source')}
                onChange={this._handleChangeDataTypes}
              />
            </div>
          </PanelWithDetails>
        )}
      </Form>
    );
  }
});
