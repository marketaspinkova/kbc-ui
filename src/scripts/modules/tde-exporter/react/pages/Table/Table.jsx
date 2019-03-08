import React from 'react';
import _ from 'underscore';
import { fromJS, Map } from 'immutable';
import { ControlLabel, FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import * as tdeCommon from '../../../tdeCommon';
import StorageStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import FilterTableModal from '../../../../components/react/components/generic/TableFiltersOnlyModal';
import FiltersDescription from '../../../../components/react/components/generic/FiltersDescription';
import ColumnsTable from './ColumnsTable';
import storageApi from '../../../../components/StorageApi';

const componentId = 'tde-exporter';
const columnTdeTypes = ['string', 'boolean', 'number', 'decimal', 'date', 'datetime'];
const defaults = {
  date: '%Y-%m-%d',
  datetime: '%Y-%m-%d %H:%M:%S'
};

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, StorageStore)],

  getInitialState() {
    return { dataPreview: null };
  },

  componentDidMount() {
    const tableId = RoutesStore.getCurrentRouteParam('tableId');

    if (!(this.state.columnsTypes && this.state.columnsTypes.count())) {
      const table = StorageStore.getAll().find(t => t.get('id') === tableId);
      let columns = Map();
      table.get('columns').forEach(column => {
        columns = columns.set(column, fromJS({ type: 'IGNORE' }));
      });
      this._updateLocalState(['editing', tableId], columns);
    }

    storageApi
      .tableDataJsonPreview(tableId, { limit: 10 })
      .then((json) => {
        this.setState({
          dataPreview: json
        });
      });
  },

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const tableId = RoutesStore.getCurrentRouteParam('tableId');
    const configData = InstalledComponentsStore.getConfigData(componentId, configId);
    const localState = InstalledComponentsStore.getLocalState(componentId, configId);
    const typedefs = configData.getIn(['parameters', 'typedefs'], Map()) || Map();

    let columnsTypes = typedefs.get(tableId, Map());

    // enforce empty Map(not List) workaround
    if (_.isEmpty(columnsTypes && columnsTypes.toJS())) {
      columnsTypes = Map();
    }

    return {
      configId,
      tableId,
      localState,
      columnsTypes,
      allTables: StorageStore.getAll(),
      isSaving: InstalledComponentsStore.getSavingConfigData(componentId, configId),
      table: StorageStore.getAll().find(table => table.get('id') === tableId),
      tdeFileName: tdeCommon.getTdeFileName(configData || Map(), tableId),
      editingTdeFileName: tdeCommon.getEditingTdeFileName(configData, localState, tableId),
      mapping: tdeCommon.getTableMapping(configData || Map(), tableId),
      editingMapping: tdeCommon.getEditingTableMapping(configData, localState, tableId)
    };
  },

  render() {
    const isEditing = !!this.state.localState.getIn(['editing', this.state.tableId]);

    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this._renderFilterModal()}
          <div className="row kbc-header">
            <div className="col-sm-2">
              {this._renderHideIngored()}
              {isEditing ? this._renderSetColumnsType() : ' '}
            </div>
            <div className="col-sm-4">{this._renderOutNameEditor(isEditing)}</div>
            <div className="col-sm-5">{this._renderTableFiltersRow(isEditing)}</div>
          </div>
          <ColumnsTable
            table={this.state.table}
            columnsTypes={this.state.columnsTypes}
            dataPreview={this.state.dataPreview}
            editingData={this.state.localState.getIn(['editing', this.state.tableId])}
            onChange={this._handleEditChange}
            isSaving={!!this.state.isSaving}
            hideIgnored={!!this.state.localState.getIn(['hideIgnored', this.state.tableId])}
          />
        </div>
      </div>
    );
  },

  _renderTableFiltersRow(isEditing) {
    let tlabel = 'Table data filter: ';

    if (isEditing) {
      tlabel = (
        <span>
          {tlabel}
          <button
            style={{ padding: '0px 10px 0px 10px' }}
            className="btn btn-link"
            type="button"
            onClick={() => {
              let ls = this.state.localState.setIn(['filterModal'], Map({ show: true }));
              ls = ls.set('mappingBackup', this.state.editingMapping);
              return this._updateLocalStateDirectly(ls);
            }}
          >
            <span className="kbc-icon-pencil" />
          </button>
        </span>
      );
    }

    return (
      <FormGroup bsSize="small">
        <ControlLabel>
          {tlabel}
        </ControlLabel>
        <FormControl.Static className="wrapper">
          <FiltersDescription value={isEditing ? this.state.editingMapping : this.state.mapping} rootClassName="" />
        </FormControl.Static>
      </FormGroup>
    );
  },

  _renderFilterModal() {
    return (
      <FilterTableModal
        value={this.state.editingMapping}
        allTables={this.state.allTables}
        show={this.state.localState.getIn(['filterModal', 'show'], false)}
        onResetAndHide={() => {
          let ls = this.state.localState;
          ls = ls.setIn(['editingMappings', this.state.tableId], ls.get('mappingBackup'));
          ls = ls.set('filterModal', Map());
          this._updateLocalStateDirectly(ls);
        }}
        onOk={() => {
          this._updateLocalState(['filterModal'], Map());
        }}
        onSetMapping={newMapping => {
          this._updateLocalState(['editingMappings', this.state.tableId], newMapping);
        }}
      />
    );
  },

  _renderOutNameEditor(isEditing) {
    const tlabel = 'Output file name:';

    if (!isEditing) {
      return (
        <FormGroup bsSize="small">
          <ControlLabel>
            {tlabel}
          </ControlLabel>
          <FormControl.Static className="wrapper">
            {this.state.tdeFileName}
          </FormControl.Static>
        </FormGroup>
      );
    }

    const errorMsg = tdeCommon.assertTdeFileName(this.state.editingTdeFileName);
    const webalized = tdeCommon.webalizeTdeFileName(this.state.editingTdeFileName);
    let msg = null;
    if (webalized !== this.state.editingTdeFileName) {
      msg = `Will be saved as ${webalized}`;
    }

    return (
      <FormGroup bsSize="small">
        <ControlLabel>
          {tlabel}
        </ControlLabel>
        <div className="wrapper">
          <FormControl
            type="text"
            bsStyle={errorMsg ? 'error' : ''}
            value={this.state.editingTdeFileName}
            onChange={e => {
              const { value } = e.target;
              const path = ['editingTdeNames', this.state.tableId];
              return this._updateLocalState(path, value);
            }}
          />
          <HelpBlock>{errorMsg || msg}</HelpBlock>
        </div>
      </FormGroup>
    );
  },

  _renderHideIngored() {
    return (
      <label>
        <input
          style={{ padding: '0' }}
          type="checkbox"
          onChange={e => {
            const path = ['hideIgnored', this.state.tableId];
            return this._updateLocalState(path, e.target.checked);
          }}
        />
        <small>{' Hide IGNORED'}</small>
      </label>
    );
  },

  _renderSetColumnsType() {
    const options = _.map(columnTdeTypes.concat('IGNORE').concat(''), opKey => {
      return (
        <option disabled={opKey === ''} value={opKey} key={opKey}>
          {opKey || 'Set All Types to:'}
        </option>
      );
    });

    return (
      <FormGroup bsSize="small">
        <FormControl
          componentClass="select"
          defaultValue=""
          onChange={e => {
            if (_.isEmpty(e.target.value)) {
              return;
            }
            return this._prefillSelectedType(e.target.value);
          }}
        >
          {options}
        </FormControl>
      </FormGroup>
    );
  },

  _prefillSelectedType(value) {
    const editingColumns = this._geteditingColumns();
    const newColumns = editingColumns.map(ec => {
      let newColumn = ec.set('type', value);

      if (_.keys(defaults).includes(value)) {
        newColumn = newColumn.set('format', defaults[value]);
        return newColumn;
      }

      newColumn = newColumn.set('format', null);
      return newColumn;
    });

    this._handleEditChange(newColumns);
  },

  _handleEditChange(data) {
    this._updateLocalState(['editing', this.state.tableId], data);
  },

  _geteditingColumns() {
    return this.state.localState.getIn(['editing', this.state.tableId]);
  },

  _updateLocalState(path, data) {
    const newLocalState = this.state.localState.setIn(path, data);
    InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  },

  _updateLocalStateDirectly(newLocalState) {
    InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState);
  }
});
