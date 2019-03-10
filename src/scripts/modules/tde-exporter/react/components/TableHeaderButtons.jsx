import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'underscore';
import { fromJS, List, Map } from 'immutable';
import * as tdeCommon from '../../tdeCommon';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import EditButtons from '../../../../react/common/EditButtons';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';

const componentId = 'tde-exporter';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, StorageTablesStore), PureRenderMixin],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const tableId = RoutesStore.getCurrentRouteParam('tableId');
    const configData = InstalledComponentsStore.getConfigData(componentId, configId);
    const localState = InstalledComponentsStore.getLocalState(componentId, configId);
    const editingData = localState.getIn(['editing', tableId], Map());

    const isValid = !(editingData && editingData.reduce((memo, value) => {
      return (
        memo || (['date', 'datetime'].includes(value && value.get('type')) && _.isEmpty(value && value.get('format')))
      );
    }
    , false));

    const isOneColumnType = editingData && editingData.reduce((memo, value) => {
      return memo || (value && value.get('type')) !== 'IGNORE';
    }, false);

    const tdeFileName = tdeCommon.getEditingTdeFileName(configData, localState, tableId);
    const fileNameValid = tdeCommon.assertTdeFileName(tdeFileName) === null;

    return {
      isSaving: InstalledComponentsStore.getSavingConfigData(componentId, configId),
      table: StorageTablesStore.getTable(tableId),
      configId,
      tableId,
      columnsTypes: configData.getIn(['parameters', 'typedefs', tableId], Map()),
      localState,
      configData,
      isEditing: !!localState.getIn(['editing', tableId]),
      editingData,
      isValid: isValid && isOneColumnType && fileNameValid,
      tdeFileName: tdeCommon.webalizeTdeFileName(tdeFileName),
      mapping: tdeCommon.getEditingTableMapping(configData, localState, tableId)
    };
  },

  render() {
    return (
      <EditButtons
        isEditing={this.state.isEditing}
        isSaving={!!this.state.isSaving}
        isDisabled={!this.state.isValid}
        editLabel="Edit"
        cancelLabel="Cancel"
        saveLabel="Save"
        onCancel={this._cancel}
        onSave={this._save}
        onEditStart={this._editStart}
      />
    );
  },

  _cancel() {
    const path = ['editing', this.state.tableId];
    let newState = this.state.localState.setIn(path, null);
    newState = newState.setIn(['editingTdeNames', this.state.tableId], null);
    newState = newState.setIn(['editingMappings', this.state.tableId], null);
    return this.setLocalState(newState, path);
  },

  _save() {
    let { tableId, editingData } = this.state;

    editingData = editingData.filter(value => {
      return !['IGNORE', ''].includes(value.get('type'));
    });

    let tableToSave = fromJS({
      source: tableId,
      columns: editingData.keySeq().toJS()
    });
    tableToSave = this.state.mapping.set('source', tableId).set('columns', editingData.keySeq());

    let inputTables = this.state.configData.getIn(['storage', 'input', 'tables'], List());
    inputTables = inputTables.filter(table => table.get('source') !== tableId);
    inputTables = inputTables.push(tableToSave);

    let configData = this.state.configData.setIn(['storage', 'input', 'tables'], inputTables);
    let typedefs = configData.getIn(['parameters', 'typedefs'], Map());

    if (_.isEmpty(typedefs && typedefs.toJS())) {
      typedefs = Map();
    }

    typedefs = typedefs.set(tableId, editingData);
    configData = configData.setIn(['parameters', 'typedefs'], typedefs);
    configData = configData.setIn(['parameters', 'tables', tableId, 'tdename'], this.state.tdeFileName);

    return InstalledComponentsActions.saveComponentConfigData(componentId, this.state.configId, configData).then(() => {
      this._cancel();
      return RoutesStore.getRouter().transitionTo('tde-exporter', { config: this.state.configId });
    });
  },

  _editStart() {
    let prepareData = Map();

    this.state.table.get('columns').forEach(column => {
      if (this.state.columnsTypes.has(column)) {
        prepareData = prepareData.set(column, this.state.columnsTypes.get(column));
      } else {
        const emptyColumn = fromJS({ type: 'IGNORE' });
        prepareData = prepareData.set(column, emptyColumn);
      }
    });

    const path = ['editing', this.state.tableId];
    const newLocalState = this.state.localState.setIn(path, prepareData);
    return this.setLocalState(newLocalState, path);
  },

  setLocalState(newLocalState, path) {
    return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  }
});
