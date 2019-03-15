import PropTypes from 'prop-types';
import React from 'react';
import Immutable from 'immutable';
import _ from 'underscore';
import CodeMirror from 'react-code-mirror';
import { Button, Alert, FormGroup, ControlLabel, HelpBlock, Checkbox, Col } from 'react-bootstrap';

import Select from '../../../../react/common/Select';
import TableSelectorForm from '../../../../react/common/TableSelectorForm';
import Tooltip from '../../../../react/common/Tooltip';

import AsynchActionError from './AsynchActionError';
import TableLoader from './TableLoaderQueryEditor';

import {getQueryEditorPlaceholder, getQueryEditorHelpText} from '../../templates/helpAndHints';

import editorMode from '../../templates/editorMode';
import { getCustomFieldsForComponent } from '../../templates/customFields';

export default React.createClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    showSimple: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    configId: PropTypes.string.isRequired,
    getDefaultOutputTable: PropTypes.func.isRequired,
    componentId: PropTypes.string.isRequired,
    isLoadingSourceTables: PropTypes.bool.isRequired,
    isTestingConnection: PropTypes.bool.isRequired,
    validConnection: PropTypes.bool.isRequired,
    connectionError: PropTypes.string,
    sourceTables: PropTypes.object.isRequired,
    sourceTablesError: PropTypes.string,
    destinationEditing: PropTypes.bool.isRequired,
    onDestinationEdit: PropTypes.func.isRequired,
    getPKColumns: PropTypes.func.isRequired,
    queryNameExists: PropTypes.bool.isRequired,
    credentialsHasDatabase: PropTypes.bool,
    credentialsHasSchema: PropTypes.bool,
    refreshMethod: PropTypes.func.isRequired,
    isConfigRow: PropTypes.bool,
    incrementalCandidates: PropTypes.object
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  isExistingTable() {
    const destinationTable = this.props.query.get('outputTable');
    if (!destinationTable || destinationTable === '') {
      return false;
    }
    return this.props.tables.has(destinationTable);
  },

  handleToggleUseQueryEditor(e) {
    let immutable = this.props.query.withMutations(function(mapping) {
      return mapping.set('advancedMode', e.target.checked);
    }, e);
    return this.props.onChange(immutable);
  },

  handleDestinationChange(newValue) {
    return this.props.onChange(this.props.query.set('outputTable', newValue));
  },

  onDestinationEdit() {
    const query = this.props.query;
    this.props.onChange(query);
    this.props.onDestinationEdit(this.props.configId, this.props.query.get('id'));
  },

  primaryKeyOptions() {
    return this.getColumnsOptions();
  },

  primaryKeyPlaceholder() {
    if (this.isExistingTable()) {
      return 'Cannot add a column';
    }
    return 'Add a column';
  },

  handlePrimaryKeyChange(newValue) {
    return this.props.onChange(this.props.query.set('primaryKey', newValue));
  },

  handleIncrementalChange(event) {
    return this.props.onChange(this.props.query.set('incremental', event.target.checked));
  },

  handleIncrementalFetchingColumnChange(newValue) {
    return this.props.onChange(this.props.query.set('incrementalFetchingColumn', newValue));
  },

  handleIncrementalFetchingLimitChange(event) {
    return this.props.onChange(this.props.query.set('incrementalFetchingLimit', parseInt(event.target.value, 10)));
  },

  handleStateReset() {
    return this.props.onChange(this.props.query.set('state', Immutable.fromJS({})));
  },

  handleQueryChange(value) {
    return this.props.onChange(this.props.query.set('query', value));
  },

  handleNameChange(event) {
    const currentOutputTable = this.props.query.get('outputTable');
    return this.props.onChange(
      this.props.query
        .set('name', event.target.value)
        .set('outputTable', !currentOutputTable ? this.props.getDefaultOutputTable(event.target.name) : currentOutputTable)
    );
  },

  handleCustomCheckboxChange(propName, event) {
    return this.props.onChange(this.props.query.set(propName, event.target.checked));
  },

  sourceTableSelectOptions() {
    if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
      const groupedTables = this.props.sourceTables.groupBy(table => table.get('schema'));
      return groupedTables.keySeq().map(function(group) {
        return {
          value: group,
          label: group,
          children: groupedTables.get(group).map(function(table) {
            return {
              value: {
                schema: table.get('schema'),
                tableName: table.get('name')
              },
              label: table.get('schema') + '.' + table.get('name')
            };
          }).toJS()
        };
      });
    } else {
      return [];
    }
  },

  getCandidateTable() {
    const selectedTable = this.props.query.get('table');
    if (!selectedTable) {
      return null;
    }
    return this.props.incrementalCandidates.find((candidate) => {
      return candidate.get('tableName') === selectedTable.get('tableName')
        && candidate.get('schema') === selectedTable.get('schema');
    });
  },

  incrementalFetchingOptions() {
    if (!this.props.incrementalCandidates || !this.props.query.get('table')) {
      return [];
    }
    let candidateTable = this.getCandidateTable();
    if (candidateTable) {
      return candidateTable.get('candidates').map((candidate) => {
        return {
          value: candidate.get('name'),
          label: candidate.get('name')
        };
      }).toList().toJS();
    } else {
      return [];
    }
  },

  getPksOnSourceTableChange(newValue) {
    const pkCols = this.props.getPKColumns(Immutable.fromJS(newValue), this.props.sourceTables);
    let sourctTablePks = pkCols.map((column) => {
      return column.get('name');
    }).toList();

    let destinationTablePks = (this.isExistingTable())
      ? this.props.tables.get(this.props.query.get('outputTable')).get('primaryKey')
      : Immutable.List();

    return (destinationTablePks.count() > 0) ? destinationTablePks : sourctTablePks;
  },

  primaryKeyHelp() {
    const { tables, query } = this.props;
    const destinationPKs = tables.get(query.get('outputTable')).get('primaryKey');
    if (Immutable.is(query.get('primaryKey'), destinationPKs)) {
      return (
        <div className="help-block">
          The output table already exists, so the primary key cannot be changed here.
        </div>
      );
    } else {
      return (
        <div className="help-block">
          <span className="text-warning">
            The primary key of the existing output table is different than the one saved here.
          </span>
          {' '}
          <a
            onClick={(e) => {
              e.preventDefault();
              this.handlePrimaryKeyChange(destinationPKs);
            }}
          >
            Set the primary key from the output table.
          </a>
        </div>
      );
    }
  },

  handleSourceTableChange(newValue) {
    const currentName = this.props.query.get('name');
    const oldTableName = this.props.query.getIn(['table', 'tableName'], '');
    const newName = (currentName && currentName !== oldTableName) ? currentName : newValue.tableName;
    const primaryKeys = (newValue === '') ? Immutable.List() : this.getPksOnSourceTableChange(newValue);
    let newQuery = this.props.query
      .set('table', (newValue === '') ? newValue : Immutable.fromJS(newValue))
      .set('name', newName ? newName : '')
      .set('primaryKey', primaryKeys);
    if (this.props.isConfigRow) {
      newQuery = newQuery.set('incrementalFetchingColumn', '');
    }
    return this.props.onChange(newQuery);
  },

  getColumnsOptions() {
    var columns = [];
    if (this.props.query.get('table')) {
      if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
        var matchedTable = this.props.sourceTables.find((table) =>
          table.get('schema') === this.props.query.get('table').get('schema')
          && table.get('name') === this.props.query.get('table').get('tableName')
        );
        if (!matchedTable) {
          return [];
        }
        columns = matchedTable.get('columns', Immutable.List()).toJS();
      } else {
        return [];
      }
    } else {
      return [];
    }

    return _.map(columns, function(column) {
      return {
        label: column.type ? (column.name + ' [' + column.type.toUpperCase() + ']') : column.name,
        value: column.name
      };
    });
  },

  handleChangeColumns(newValue) {
    let query = this.props.query.set('columns', newValue);
    return this.props.onChange(query);
  },

  getQuery() {
    return this.props.query.get('query') || '';
  },

  getTableValue() {
    if (this.props.query.get('table')) {
      return this.props.query.get('table').get('tableName');
    } else return '';
  },

  getOutputTableValue() {
    if (this.props.query.get('outputTable') !== '') {
      return this.props.query.get('outputTable');
    } else {
      return this.props.getDefaultOutputTable(this.props.query.get('name'));
    }
  },

  getPkValue() {
    const pk = this.props.query.get('primaryKey');
    if (Immutable.List.isList(pk)) {
      return pk;
    }
    return Immutable.List();
  },

  render() {
    return (
      <div className="kbc-inner-padding">
        <div className="form-horizontal">
          <AsynchActionError
            componentId={this.props.componentId}
            configId={this.props.configId}
            connectionTesting={this.props.isTestingConnection}
            connectionError={this.props.connectionError}
            sourceTablesLoading={this.props.isLoadingSourceTables}
            sourceTablesError={this.props.sourceTablesError}
          />
          {this.renderSimpleTable()}
          {this.renderSimpleColumns()}
          <h3>General Settings</h3>
          <div className={(this.props.queryNameExists) ? 'form-group has-error' : 'form-group'}>
            <label className="col-md-3 control-label">Name</label>
            <div className="col-md-9">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('name')}
                ref="queryName"
                placeholder="e.g. Untitled Query"
                disabled={this.props.disabled}
                onChange={this.handleNameChange}
              />
              {(this.props.queryNameExists) ? <div className="help-block">This name already exists</div> : null}
            </div>
          </div>
          <div>
            <TableSelectorForm
              labelClassName="col-md-3"
              wrapperClassName="col-md-9"
              value={this.getOutputTableValue()}
              onChange={this.handleDestinationChange}
              disabled={this.props.disabled}
              label="Destination"
              help="Where the table will be imported.
                    If the table or bucket does not exist, it will be created."
              onEdit={this.onDestinationEdit}
              editing={this.props.destinationEditing}
            />
          </div>
          {this.renderIncrementalFetchingSection()}
          <h3>Loading Options</h3>
          <div className="form-group">
            <label className="col-md-3 control-label">Primary Key</label>
            <div className="col-md-9">
              <Select
                name="primaryKey"
                value={this.getPkValue()}
                multi={true}
                disabled={this.props.disabled || this.isExistingTable()}
                allowCreate={true}
                delimiter=","
                placeholder={this.primaryKeyPlaceholder()}
                emptyStrings={false}
                onChange={this.handlePrimaryKeyChange}
                options={this.primaryKeyOptions()}
                promptTextCreator={(label) => (label) ? 'Add column "' + label + '" as primary key' : ''}
              />
              {this.isExistingTable() && this.primaryKeyHelp()}
            </div>
          </div>
          {this.renderIncrementalLoadOption()}
          {this.renderCustomFields()}
          <h3>Advanced Mode</h3>
          {this.renderQueryToggle()}
          {this.renderQueryEditor()}
        </div>
      </div>
    );
  },

  renderCustomFields() {
    const isAdvancedMode = this.props.query.get('advancedMode');
    return getCustomFieldsForComponent(this.props.componentId).reduce((customFields, field) => {
      if ((field.showInAdvancedMode && isAdvancedMode) || !isAdvancedMode) {
        if (field.type === 'checkbox') {
          customFields.push(
            <FormGroup key={`custom-field-${field.name}`}>
              <Col mdOffset={3} md={9}>
                <Checkbox
                  checked={!!this.props.query.get(field.name)}
                  disabled={this.props.disabled}
                  onChange={event => this.handleCustomCheckboxChange(field.name, event)}
                >
                  {field.label}
                </Checkbox>
                <HelpBlock>{field.help}</HelpBlock>
              </Col>
            </FormGroup>
          );
        }
      }
      return customFields;
    }, []);
  },

  renderIncrementalLoadOption() {
    let helpAlert = null;
    if (this.props.query.get('incrementalFetchingColumn') && !this.props.query.get('incremental')) {
      helpAlert = (
        <Alert bsStyle="warning">
          It is recommended to enable incremental loading if using incremental fetching.
          If incremental loading is <strong>not</strong> enabled,
          the storage table will always contain only the most recently fetched results.
        </Alert>
      );
    }
    return (
      <div className="form-group">
        <div className="col-md-9 col-md-offset-3 checkbox">
          <label>
            <input
              type="checkbox"
              checked={this.props.query.get('incremental')}
              onChange={this.handleIncrementalChange}
              disabled={this.props.disabled}
            />
            Incremental Loading
          </label>
          <div className="help-block">
            If incremental load is turned on, the table will be updated instead of rewritten.
            Tables with a primary key will have rows updated, tables without a primary key will have rows appended.
            {helpAlert}
          </div>
        </div>
      </div>
    );
  },

  renderQueryToggle() {
    if (this.props.showSimple) {
      return (
        <div className="form-group">
          <div className="col-md-9 col-md-offset-3 checkbox">
            <label>
              <input
                standalone={true}
                type="checkbox"
                label="Use query editor"
                checked={!!this.props.query.get('advancedMode')}
                disabled={this.props.disabled}
                onChange={this.handleToggleUseQueryEditor}/>
              Create your own query using an SQL editor
            </label>
          </div>
        </div>
      );
    }
  },

  renderQueryEditor() {
    if (this.props.query.get('advancedMode')) {
      return (
        <div>
          <label className="control-label">SQL Query</label>
          {this.renderQueryHelpBlock()}
          <CodeMirror
            theme="solarized"
            mode={editorMode(this.props.componentId)}
            value={this.getQuery()}
            onChange={(e) => this.handleQueryChange(e.target.value)}
            lineNumbers
            lineWrapping={false}
            placeholder={getQueryEditorPlaceholder(this.props.componentId)}
            style={{ width: '100%' }}
          />
        </div>
      );
    }
  },

  renderSimpleTable() {
    if (this.props.showSimple && !this.props.query.get('advancedMode')) {
      var tableSelector = (
        <Select
          name="sourceTable"
          value={this.getTableValue()}
          placeholder="Select source table"
          onChange={this.handleSourceTableChange}
          optionRenderer={this.optionRenderer}
          options={this.transformOptions(this.sourceTableSelectOptions())}
          disabled={this.props.disabled}
        />
      );

      return (
        <div>
          <h3>Data Source</h3>
          <div className="form-group">
            <label className="col-md-3 control-label">Table</label>
            <div className="col-md-9">
              <TableLoader
                componentId={this.props.componentId}
                configId={this.props.configId}
                isLoadingSourceTables={this.props.isLoadingSourceTables}
                isTestingConnection={this.props.isTestingConnection}
                validConnection={this.props.validConnection}
                tableSelectorElement={tableSelector}
                refreshMethod={this.props.refreshMethod}
              />
            </div>
          </div>
        </div>
      );
    }
  },

  renderSimpleColumns() {
    if (!this.props.showSimple || this.props.query.get('advancedMode')) {
      return null;
    }

    const columnsOptions = this.getColumnsOptions();
    const isDisabled = this.props.disabled || !this.props.query.get('table');

    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={3}>Columns</Col>
        <Col md={9}>
          <Select
            multi
            name="columns"
            value={this.props.query.get('columns', Immutable.List())}
            disabled={isDisabled}
            placeholder="All columns will be imported"
            onChange={this.handleChangeColumns}
            options={columnsOptions}
          />
          <HelpBlock>
            If you only need to exclude a couple of columns, you can{' '}
            <Button
              bsStyle="link"
              className="btn-link-inline"
              disabled={isDisabled}
              onClick={() => {
                const allColumns = columnsOptions.map(option => option.value);
                this.handleChangeColumns(allColumns);
              }}
            >
              add all columns
            </Button>{' '}
            and then remove the ones you don&apos;t want.
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderQueryHelpBlock() {
    const helpText = getQueryEditorHelpText(this.props.componentId);
    if (helpText) {
      return (
        <div className="help-block">
          {helpText}
        </div>
      );
    } else if (this.props.componentId === 'keboola.ex-db-mysql' && !this.props.credentialsHasDatabase) {
      return (
        <div className="help-block">
          <i className="fa fa-exclamation-triangle"/> This connection does not have a database specified, so please be sure to prefix table names with the schema
          <br/>(e.g. `schemaName`.`tableName`)
        </div>
      );
    } else if (this.props.componentId === 'keboola.ex-db-snowflake' && !this.props.credentialsHasSchema) {
      return (
        <div className="help-block">
          <i className="fa fa-exclamation-triangle"/> This connection does not have a schema specified, so please be sure to prefix table names with the schema
          <br/>(e.g. &quot;schemaName&quot;.&quot;tableName&quot;)
        </div>
      );
    }
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, o) => {
      const parent = option(o.value, o.label, (<strong style={{color: '#000'}}>Schema: {o.label}</strong>), true);
      const children = o.children.map(c => option(c.value, c.label, <div style={{paddingLeft: 10}}>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  },

  renderIncrementalFetchingForm() {
    return [
      <div className="form-group" key="column">
        <label className="col-md-3 control-label">Column</label>
        <div className="col-md-9">
          <Select
            name="incrementalFetching"
            value={this.props.query.get('incrementalFetchingColumn') || ''}
            placeholder="Fetch by column"
            onChange={this.handleIncrementalFetchingColumnChange}
            options={this.incrementalFetchingOptions()}
            disabled={this.props.disabled || !!this.getLastFetchedRowValue()}
          />
          <div className="help-block">
            {this.incrementalFetchingWarning()}
          </div>
        </div>
      </div>,
      <div className="form-group" key="limit">
        <label className="col-md-3 control-label">Limit</label>
        <div className="col-md-9">
          <input
            className="form-control"
            name="incrementalFetchingLimit"
            type="number"
            value={this.props.query.get('incrementalFetchingLimit') || 0}
            onChange={this.handleIncrementalFetchingLimitChange}
            disabled={this.props.disabled || !this.props.query.get('incrementalFetchingColumn')}
          />
          <div className="help-block">
            The number of records to fetch from the source per run.
            Subsequent runs will start from the last record fetched. Note: 0 means unlimited.
          </div>
        </div>
      </div>,
      this.renderLastFetchedInfo()
    ];
  },

  renderIncrementalFetchingSection() {
    if (!this.props.query.get('advancedMode') && this.props.isConfigRow) {
      const fetchingHelpText = (
        <div className="form-group">
          <div className="col-md-8 col-md-offset-3 help-block">
            Incremental fetching is available for this extractor
            but only for tables containing numeric or timestamp/datetime columns.
          </div>
        </div>
      );
      return (
        <div>
          <h3>Incremental Fetching</h3>
          {
            (this.incrementalFetchingOptions().length > 0 || this.props.query.get('incrementalFetchingColumn'))
              ? this.renderIncrementalFetchingForm()
              : fetchingHelpText
          }
        </div>
      );
    }
  },

  renderLastFetchedInfo() {
    var formElement;
    const fetchingColumn = this.props.query.get('incrementalFetchingColumn');
    if (fetchingColumn) {
      let lastFetchedRowValue = this.getLastFetchedRowValue();
      if (lastFetchedRowValue) {
        const tooltip = 'Resetting means that the next run will start from the lowest value of ' + fetchingColumn;
        formElement = (
          <div className="form-control-static">
            <div>
              <strong>{lastFetchedRowValue}</strong>
            </div>
            <div className="help-block">
              To start from the beginning of the table, you can
              {' '}
              <a onClick={this.handleStateReset}>
                <Tooltip
                  tooltip={tooltip}
                  placement="top"
                >
                  <span>clear the stored value</span>
                </Tooltip>
              </a>
              .
            </div>
          </div>
        );
      } else {
        formElement = (
          <div className="form-control-static">
            There is no value stored.
            <div className="help-block">
              Either the component has not yet run, or it has been reset.
            </div>
          </div>
        );
      }
      return (
        <div className="form-group" key="last-fetched-value">
          <label className="col-md-3 control-label">Last Fetched Value</label>
          <div className="col-md-8">
            {formElement}
          </div>
        </div>
      );
    }
  },

  incrementalFetchingWarning() {
    var infoMessage = 'If enabled, only newly created or updated records since the last run will be fetched.';
    if (
      this.props.query.get('incrementalFetchingColumn')
      && this.props.sourceTables.count() > 0
      && !!this.props.query.get('table')
    ) {
      let candidateTable = this.getCandidateTable();
      if (candidateTable) {
        let candidateColumn = candidateTable.get('candidates').find((column) =>
          column.get('name') === this.props.query.get('incrementalFetchingColumn')
        );
        if (candidateColumn.get('autoIncrement')) {
          infoMessage = 'Using an autoIncrement ID means that only new records will be fetched, not updates or' +
            ' deletes.';
        } else {
          infoMessage = 'Using an update timestamp column means that only new and updated records will be fetched,' +
            ' not deletes.';
        }
      } else {
        infoMessage = 'In order to enable incremental fetching, the source table must contain a timestamp column or' +
          ' an auto-incrementing primary key';
      }
    }
    return infoMessage;
  },

  getLastFetchedRowValue() {
    let queryState = this.props.query.get('state');
    if (queryState && queryState.has('lastFetchedRow')) {
      return queryState.get('lastFetchedRow');
    } else {
      return false;
    }
  }
});
