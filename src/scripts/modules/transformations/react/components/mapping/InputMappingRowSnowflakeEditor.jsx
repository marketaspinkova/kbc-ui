import React from 'react';
import _ from 'underscore';

import Immutable from 'immutable';
import {Input} from './../../../../../react/common/KbcBootstrap';

import { Form, FormGroup, ControlLabel, Col, HelpBlock } from 'react-bootstrap';
import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import DatatypeForm from './input/DatatypeForm';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';
import {PanelWithDetails} from '@keboola/indigo-ui';
import MetadataStore from '../../../../components/stores/MetadataStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { SnowflakeDataTypesMapping } from '../../../Constants';

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
      tableColumnMetadata: source ? MetadataStore.getTableColumnsMetadata(source) : Immutable.Map()
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
      let mutation = mapping.set('source', value);
      mutation = mutation.set('destination', destination);
      mutation = mutation.set('datatypes', this.getInitialDatatypes(value));
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
      const initialDatatypes = this.getInitialDatatypes(mapping.get('source'));
      if (newValue.count()) {
        const columns = mutation.get('columns');
        if (!_.contains(columns.toJS(), mutation.get('whereColumn'))) {
          mutation = mutation.set('whereColumn', '');
          mutation = mutation.set('whereValues', Immutable.List());
          mutation = mutation.set('whereOperator', 'eq');
        }
        const currentDatatypes = this.getDatatypes();
        let newDatatypes = Immutable.Map();
        columns.forEach((column) => {
          if (currentDatatypes.has(column)) {
            newDatatypes = newDatatypes.set(column, currentDatatypes.get(column));
          } else {
            newDatatypes = newDatatypes.set(column, initialDatatypes.get(column));
          }
        });
        mutation = mutation.set('datatypes', Immutable.fromJS(newDatatypes || Immutable.Map()));
      } else {
        mutation = mutation.set('datatypes', Immutable.fromJS(initialDatatypes || Immutable.Map()));
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
      return Immutable.Map();
    }
    const selectedTable = this.props.tables.find((table) => {
      return table.get('id') === this.props.value.get('source');
    });
    return selectedTable;
  },

  _getColumns() {
    return this.getSelectedTable() ? this.getSelectedTable().get('columns', Immutable.List()) : Immutable.List();
  },

  isPrimaryKeyColumn(column) {
    return this.getSelectedTable().get('primaryKey', Immutable.List()).has(column);
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
    return this.props.value.get('columns', Immutable.List()).count() > 0
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

  getMetadataDataTypes(columnMetadata) {
    return columnMetadata.map((metadata, colname) => {
      let datatypeLength = metadata.filter((entry) => {
        return entry.get('key') === 'KBC.datatype.length';
      });
      if (datatypeLength.count() > 0) {
        datatypeLength = datatypeLength.get(0);
      }
      let datatypeNullable = metadata.filter((entry) => {
        return entry.get('key') === 'KBC.datatype.nullable';
      });
      if (datatypeNullable.count() > 0) {
        datatypeNullable = datatypeNullable.get(0);
      }
      let basetype = metadata.filter((entry) => {
        return entry.get('key') === 'KBC.datatype.basetype';
      });

      if (basetype.count() === 0) {
        return null;
      } else {
        basetype = basetype.get(0);
      }
      let datatypeName, length = null;

      let datatype = SnowflakeDataTypesMapping.map((mappedDatatype) => {
        if (mappedDatatype.get('basetype') === basetype.get('value')) {
          datatypeName = mappedDatatype.get('name');
          return mappedDatatype;
        }
      });
      const mapType = datatype.get(datatypeName);
      if (mapType) {
        length = mapType.get('size') ? datatypeLength.get('value') : null;
        if (mapType.has('maxLength') && length > mapType.get('maxLength')) {
          length = mapType.get('maxLength');
        }
      }
      return Immutable.fromJS({
        column: colname,
        type: datatypeName,
        length: length,
        convertEmptyValuesToNull: isNaN(datatypeNullable.get('value'))
          ? datatypeNullable.get('value')
          : !!parseInt(datatypeNullable.get('value'), 10)
      });
    });
  },

  getDefaultDatatypes() {
    if (this.state.hasMetadataDatatypes) {
      const metadataSet = this.state.tableColumnMetadata.filter((metadata, colname) => {
        return this._getFilteredColumns().indexOf(colname) > -1;
      });
      return this.getMetadataDataTypes(metadataSet);
    } else {
      return Immutable.fromJS(this._getFilteredColumns()).reduce((memo, column) => {
        return memo.set(column, Immutable.fromJS({
          column: column,
          type: 'VARCHAR',
          length: this.isPrimaryKeyColumn(column) ? 255 : null,
          convertEmptyValuesToNull: false
        }));
      }, Immutable.Map());
    }
  },

  getInitialDatatypes(sourceTable) {
    if (MetadataStore.tableHasMetadataDatatypes(sourceTable)) {
      return this.getMetadataDataTypes(MetadataStore.getTableColumnsMetadata(sourceTable));
    } else {
      return this.props.tables.find((table) => {
        return table.get('id') === sourceTable;
      }).get('columns').reduce((memo, column) => {
        return memo.set(column, Immutable.fromJS({
          column: column,
          type: 'VARCHAR',
          length: this.isPrimaryKeyColumn(column) ? 255 : null,
          convertEmptyValuesToNull: false
        }));
      }, Immutable.Map());
    }
  },

  getDatatypes() {
    return this.getDefaultDatatypes().map((defaultType) => {
      const existingTypeFilter = this.props.value.get('datatypes', Immutable.Map()).filter((existingType) => {
        return existingType.get('column') === defaultType.get('column');
      });
      if (existingTypeFilter.count() > 0) {
        return existingTypeFilter.get(defaultType.get('column'));
      } else {
        return defaultType;
      }
    });
  },

  render() {
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
        <Input
          type="text"
          label="Destination"
          value={this.props.value.get('destination')}
          disabled={this.props.disabled}
          placeholder="Destination table name in transformation DB"
          onChange={this._handleChangeDestination}
          labelClassName="col-sm-2"
          wrapperClassName="col-sm-10"
          bsStyle={this.props.isDestinationDuplicate ? 'error' : null}
          help={
            this.props.isDestinationDuplicate
              ? <span className="error">
                    Duplicate Destination <code>{this.props.value.get('destination')}</code>.
              </span>
              : null
          }
        />
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>Columns</Col>
            <Col sm={10}>
              <Select
                multi={true}
                name="columns"
                value={this.props.value.get('columns', Immutable.List()).toJS()}
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
        </PanelWithDetails>
      </Form>
    );
  }
});
