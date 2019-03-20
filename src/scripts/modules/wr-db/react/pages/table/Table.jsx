import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';

import { fromJS, Map, List } from 'immutable';
import { capitalize } from 'underscore.string';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TableNameEdit from './TableNameEdit';
import ColumnsEditor from './ColumnsEditor';
import DataTypes from '../../../templates/dataTypes';
import columnTypeValidation from '../../../columnTypeValidation';

import storageApi from '../../../../components/StorageApi';
import WrDbStore from '../../../store';
import WrDbActions from '../../../actionCreators';
import V2Actions from '../../../v2-actions';
import RoutesStore from '../../../../../stores/RoutesStore';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';

import EditButtons from '../../../../../react/common/EditButtons';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import FiltersDescription from '../../../../components/react/components/generic/FiltersDescription';
import IsDockerBasedFn from '../../../templates/dockerProxyApi';
import IncrementalSetupModal from './IncrementalSetupModal';
import {Alert} from 'react-bootstrap';

const defaultDataTypes = [
  'INT',
  'BIGINT',
  { VARCHAR: { defaultSize: '255' } },
  'TEXT',
  { DECIMAL: { defaultSize: '12,2' } },
  'DATE',
  'DATETIME'
];

export default componentId => {
  return createReactClass({
    mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore, StorageTablesStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const tableId = RoutesStore.getCurrentRouteParam('tableId');
      const tableConfig = WrDbStore.getTableConfig(componentId, configId, tableId);
      const storageTableColumns = StorageTablesStore.getTable(tableId, Map()).get('columns', List());
      const localState = InstalledComponentsStore.getLocalState(componentId, configId);
      const tablesExportInfo = WrDbStore.getTables(componentId, configId);
      const exportInfo = tablesExportInfo.find(tab => tab.get('id') === tableId);
      const isUpdatingTable = WrDbStore.isUpdatingTable(componentId, configId, tableId);
      const isSavingColumns = !!WrDbStore.getUpdatingColumns(componentId, configId, tableId);
      const hideIgnored = localState.getIn(['hideIgnored', tableId], false);
      const v2Actions = V2Actions(configId, componentId);
      const editingData = WrDbStore.getEditing(componentId, configId);
      const columnsValidation = editingData.getIn(['validation', tableId], Map());
      const columns = this._prepareColumns(tableConfig.get('columns'), storageTableColumns);
      const editingColumns = this._prepareEditingColumns(columns, editingData.getIn(['columns', tableId]));

      // state
      return {
        allTables: StorageTablesStore.getAll(),
        columnsValidation,
        hideIgnored,
        editingColumns,
        editingData,
        isUpdatingTable,
        tableConfig,
        columns,
        tableId,
        configId,
        localState,
        exportInfo,
        isSavingColumns,
        v2Actions,
        v2State: localState.get('v2', Map()),
        v2ConfigTable: v2Actions.configTables.find(t => t.get('tableId') === tableId)
      };
    },

    getInitialState() {
      return { dataPreview: null };
    },

    _prepareEditingColumns(columns, editingColumns) {
      if (!editingColumns) {
        return;
      }

      return columns.toMap().mapKeys((key, column) => column.get('name')).map((column, key) => {
        return editingColumns.get(key, column);
      });
    },

    _prepareColumns(configColumns, storageColumns) {
      const configColumnsNamesSet = configColumns.map(c => c.get('name')).toSet();
      const deletedColumns = configColumnsNamesSet.subtract(storageColumns);
      const allColumns = storageColumns.concat(deletedColumns);
      return allColumns.map(function(storageColumn) {
        const configColumnFound = configColumns.find(cc => cc.get('name') === storageColumn);
        if (configColumnFound) {
          return configColumnFound;
        } else {
          return fromJS({
            name: storageColumn,
            dbName: storageColumn,
            type: 'IGNORE',
            null: false,
            default: '',
            size: ''
          });
        }
      });
    },

    componentDidMount() {
      const tableId = RoutesStore.getCurrentRouteParam('tableId');
      return storageApi.tableDataJsonPreview(tableId, { limit: 10 }).then(json =>
        this.setState({
          dataPreview: json
        })
      );
    },

    render() {
      const isRenderIncremental = IsDockerBasedFn(componentId) && componentId !== 'wr-db-mssql';
      const exportInfo = this.state.v2ConfigTable;
      const primaryKey = exportInfo.get('primaryKey', List());
      const dbColumns = this.state.columns.map(c => c.get('dbName'));
      const pkMismatchList = primaryKey.reduce(
        (memo, pkColumn) =>
          !dbColumns.find(dbColumn => dbColumn === pkColumn) ? memo.push(pkColumn) : memo
        , List());

      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="kbc-header">
              <ul className="list-group list-group-no-border">
                <li className="list-group-item">{this._renderTableEdit()}</li>
                {componentId === 'keboola.wr-thoughtspot' && (
                  <li className="list-group-item">{this._renderThoughSpotTypeInput()}</li>
                )}
                {isRenderIncremental && <li className="list-group-item">{this._renderIncrementalSetup()}</li>}
                {isRenderIncremental && <li className="list-group-item">{this._renderTableFiltersRow()}</li>}
                {isRenderIncremental && <li className="list-group-item">{this._renderPrimaryKey()}</li>}
              </ul>
              {pkMismatchList.size > 0 &&
              <Alert bsStyle="warning">
                The primary Key is set to non-existing column(s). Please update the Primary Key settings.
              </Alert>
              }
            </div>
            <ColumnsEditor
              onToggleHideIgnored={e => {
                const path = ['hideIgnored', this.state.tableId];
                return this._updateLocalState(path, e.target.checked);
              }}
              dataTypes={this._getComponentDataTypes()}
              columns={this.state.columns}
              editingColumns={this.state.editingColumns}
              isSaving={this.state.isSavingColumns}
              editColumnFn={this._onEditColumn}
              columnsValidation={this.state.columnsValidation}
              filterColumnsFn={this._hideIgnoredFilter}
              filterColumnFn={this._filterColumn}
              dataPreview={this.state.dataPreview}
              editButtons={this._renderEditButtons()}
              setAllColumnsType={this._renderSetColumnsType()}
              setAllColumnsName={this._renderSetColumnsName()}
              disabledColumnFields={this._getDisabledColumnFields()}
              onSetAllColumnsNull={e => {
                const value = e.target.checked ? '1' : '0';
                return this.state.editingColumns.map(ec => {
                  const newColumn = ec.set('null', value);
                  return this._onEditColumn(newColumn);
                });
              }}
            />
          </div>
        </div>
      );
    },

    _setValidateColumn(cname, isValid) {
      const path = ['validation', this.state.tableId, cname];
      return WrDbActions.setEditingData(componentId, this.state.configId, path, isValid);
    },

    _validateColumn(column) {
      const type = column.get('type');
      const size = column.get('size');
      const shouldHaveSize = this._getSizeParam(type);
      const sizeValid = columnTypeValidation.validate(type, size);

      return this._setValidateColumn(column.get('name'), !shouldHaveSize || sizeValid);
    },

    _showIncrementalSetupModal() {
      return this.state.v2Actions.updateV2State(['IncrementalSetup', 'show'], true);
    },

    _renderIncrementalSetup() {
      const exportInfo = this.state.v2ConfigTable;
      const { v2State } = this.state;
      const isIncremental = exportInfo.get('incremental');
      const primaryKey = exportInfo.get('primaryKey', List());
      const showIncrementalSetupPath = ['IncrementalSetup', 'show'];
      const tableMapping = this.state.v2Actions.getTableMapping(this.state.tableId);

      return (
        <div className="row">
          <div className="col-sm-3">
            <strong>Load Type</strong>
          </div>
          <div className="col-sm-9">
            <button
              className="btn btn-link"
              style={{ paddingTop: 0, paddingBottom: 0 }}
              disabled={!!this.state.editingColumns}
              onClick={this._showIncrementalSetupModal}
            >
              {isIncremental ? 'Incremental Load' : 'Full Load'} <span className="kbc-icon-pencil" />
            </button>
            <IncrementalSetupModal
              isSaving={this.state.v2State.get('savingIncremental', false)}
              show={v2State.getIn(showIncrementalSetupPath, false)}
              onHide={() => this.state.v2Actions.updateV2State(showIncrementalSetupPath, false)}
              currentPK={primaryKey.join(',')}
              currentMapping={tableMapping}
              columns={this.state.columns.map(c => c.get('dbName'))}
              isIncremental={isIncremental}
              allTables={this.state.allTables}
              onSave={(incremental, primary, newMapping, customFieldsValues) => {
                this.state.v2Actions.updateV2State('savingIncremental', true);
                const finishSaving = () => this.state.v2Actions.updateV2State('savingIncremental', false);
                const newExportInfo = exportInfo
                  .set('primaryKey', primary)
                  .set('incremental', incremental)
                  .mergeDeep(customFieldsValues);

                return this._setV2TableInfo(newExportInfo).then(() => {
                  if (newMapping !== tableMapping) {
                    return this.state.v2Actions.setTableMapping(newMapping).then(finishSaving);
                  } else {
                    return finishSaving();
                  }
                });
              }}
              customFieldsValues={this._getCustomFieldsValues()}
              componentId={componentId}
            />
          </div>
        </div>
      );
    },

    _renderPrimaryKey() {
      const exportInfo = this.state.v2ConfigTable;
      const primaryKey = exportInfo.get('primaryKey', List());
      return (
        <div className="row">
          <div className="col-sm-3">
            <strong>Primary Key</strong>
          </div>
          <div className="col-sm-9">
            <button
              className="btn btn-link"
              style={{ paddingTop: 0, paddingBottom: 0 }}
              disabled={!!this.state.editingColumns}
              onClick={this._showIncrementalSetupModal}
            >
              {primaryKey.join(', ') || 'N/A'} <span className="kbc-icon-pencil" />
            </button>
          </div>
        </div>
      );
    },

    _renderThoughSpotTypeInput() {
      const tableType = this.state.v2ConfigTable.get('type', 'standard');
      return (
        <div className="row">
          <div className="col-sm-3">
            <strong>Table Type</strong>
          </div>
          <div className="col-sm-9">
            <button
              className="btn btn-link"
              style={{ paddingTop: 0, paddingBottom: 0 }}
              disabled={!!this.state.editingColumns}
              onClick={this._showIncrementalSetupModal}
            >
              {tableType.toUpperCase()} <span className="kbc-icon-pencil" />
            </button>
          </div>
        </div>
      );
    },

    _getCustomFieldsValues() {
      if (componentId === 'keboola.wr-thoughtspot') {
        return Map({ type: this.state.v2ConfigTable.get('type', 'standard') });
      }

      return Map();
    },

    _onEditColumn(newColumn) {
      const cname = newColumn.get('name');
      const path = ['columns', this.state.tableId, cname];
      WrDbActions.setEditingData(componentId, this.state.configId, path, newColumn);
      return this._validateColumn(newColumn);
    },

    _filterColumn(column) {
      return !(column.get('type') === 'IGNORE' && this.state.hideIgnored);
    },

    _hideIgnoredFilter(columns) {
      if (!columns) {
        return columns;
      }
      const newCols = columns.filterNot(c => {
        return c.get('type') === 'IGNORE' && this.state.hideIgnored;
      });
      return newCols;
    },

    _handleEditColumnsStart() {
      const path = ['columns', this.state.tableId];
      const columns = this.state.columns.toMap().mapKeys((key, column) => column.get('name'));
      return WrDbActions.setEditingData(componentId, this.state.configId, path, columns);
    },

    _handleEditColumnsSave() {
      // to preserve order remap according the original columns
      const columns = this.state.columns.map(c => {
        return this.state.editingColumns.get(c.get('name'));
      });
      return WrDbActions.saveTableColumns(componentId, this.state.configId, this.state.tableId, columns).then(() => {
        return this._handleEditColumnsCancel();
      });
    },

    _renderSetColumnsType() {
      const tmpDataTypes = this._getDataTypes();
      const options = _.map(tmpDataTypes.concat('IGNORE').concat(''), opKey => (
        <option disabled={opKey === ''} value={opKey} key={opKey}>
          {opKey === '' ? 'Set All Columns To' : opKey}
        </option>
      ));

      return (
        <span>
          <select
            defaultValue=""
            onChange={e => {
              const { value } = e.target;
              return this.state.editingColumns.map(ec => {
                let newColumn = ec.set('type', value);
                if (_.isString(this._getSizeParam(value))) {
                  const defaultSize = this._getSizeParam(value);
                  newColumn = newColumn.set('size', defaultSize);
                } else {
                  newColumn = newColumn.set('size', '');
                }
                return this._onEditColumn(newColumn);
              });
            }}
          >
            {options}
          </select>
        </span>
      );
    },

    _renderSetColumnsName() {
      return (
        <div>
          <select
            defaultValue=""
            onChange={e => {
              return this.state.editingColumns.map(column => {
                switch (e.target.value) {
                  case 'uppercase':
                    return this._onEditColumn(column.update('dbName', name => name.toUpperCase()));
                  case 'lowercase':
                    return this._onEditColumn(column.update('dbName', name => name.toLowerCase()));
                  case 'capitalize':
                    return this._onEditColumn(column.update('dbName', name => capitalize(name, true)));
                  default:
                    break;
                }
              });
            }}
          >
            <option disabled value="">Convert All Names To</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      );
    },

    _getComponentDataTypes() {
      return DataTypes[componentId] && DataTypes[componentId].typesList
        ? DataTypes[componentId].typesList
        : defaultDataTypes;
    },

    _getDisabledColumnFields() {
      return DataTypes[componentId] && DataTypes[componentId].disabledFields
        ? DataTypes[componentId].disabledFields
        : [];
    },

    _getSizeParam(dataType) {
      const dtypes = this._getComponentDataTypes();
      const dt = _.find(dtypes, d => _.isObject(d) && _.keys(d)[0] === dataType);
      return dt && dt[dataType] && dt[dataType].defaultSize;
    },

    _getDataTypes() {
      const dtypes = this._getComponentDataTypes();
      return _.map(dtypes, function(dataType) {
        // it could be object eg {VARCHAR: {defaultSize:''}}
        if (_.isObject(dataType)) {
          return _.keys(dataType)[0];
        } else {
          // or string
          return dataType;
        }
      });
    },

    _handleEditColumnsCancel() {
      const path = ['columns', this.state.tableId];
      WrDbActions.setEditingData(componentId, this.state.configId, path, null);
      return this._clearValidation();
    },

    _clearValidation() {
      const path = ['validation', this.state.tableId];
      return WrDbActions.setEditingData(componentId, this.state.configId, path, Map());
    },

    _renderTableEdit() {
      return (
        <div className="row">
          <div className="col-sm-3">
            <strong>Database table name</strong>
          </div>
          <div className="col-sm-9">
            <TableNameEdit
              tableId={this.state.tableId}
              table={this.state.table}
              configId={this.state.configId}
              tableExportedValue={
                this.state.exportInfo && this.state.exportInfo.get('export')
                  ? this.state.exportInfo.get('export')
                  : false
              }
              currentValue={
                this.state.exportInfo && this.state.exportInfo.get('name')
                  ? this.state.exportInfo.get('name')
                  : this.state.tableId
              }
              isSaving={this.state.isUpdatingTable}
              editingValue={this.state.editingData.getIn(['editingDbNames', this.state.tableId])}
              setEditValueFn={value => {
                const path = ['editingDbNames', this.state.tableId];
                return WrDbActions.setEditingData(componentId, this.state.configId, path, value);
              }}
              componentId={componentId}
            />
          </div>
        </div>
      );
    },

    _renderTableFiltersRow() {
      const tableMapping = this.state.v2Actions.getTableMapping(this.state.tableId);
      return (
        <div className="row">
          <div className="col-sm-3">
            <strong>Data Filter</strong>
          </div>
          <div className="col-sm-9">
            <button
              className="btn btn-link"
              style={{ paddingTop: 0, paddingBottom: 0 }}
              disabled={!!this.state.editingColumns}
              onClick={this._showIncrementalSetupModal}
            >
              <FiltersDescription value={tableMapping} rootClassName="" />
              <span className="kbc-icon-pencil" />
            </button>
          </div>
        </div>
      );
    },

    _renderEditButtons() {
      const isValid = this.state.columnsValidation
        ? this.state.columnsValidation.reduce((memo, value) => memo && value, true)
        : null;
      const hasColumns = this.state.editingColumns
        ? this.state.editingColumns.reduce(function(memo, c) {
          const type = c.get('type');
          return type !== 'IGNORE' || memo;
        }, false)
        : null;

      return (
        <div className="kbc-buttons pull-right">
          <EditButtons
            isEditing={!!this.state.editingColumns}
            isSaving={this.state.isSavingColumns}
            isDisabled={!(isValid && hasColumns)}
            onCancel={this._handleEditColumnsCancel}
            onSave={this._handleEditColumnsSave}
            onEditStart={this._handleEditColumnsStart}
            editLabel="Edit Columns"
          />
        </div>
      );
    },

    _setV2TableInfo(newTableInfo) {
      return this.state.v2Actions.setTableInfo(this.state.tableId, newTableInfo);
    },

    _updateLocalState(path, data) {
      const newLocalState = this.state.localState.setIn(path, data);
      return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState);
    }
  });
};
