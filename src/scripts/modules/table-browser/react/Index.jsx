import React from 'react';
import createReactClass from 'create-react-class';
import Immutable, {List, Map, fromJS} from 'immutable';

import Promise from 'bluebird';

import storageActions from '../../components/StorageActionCreators';
import tablesStore from '../../components/stores/StorageTablesStore';

import TableLinkModalDialog from './components/ModalDialog';

import createStoreMixin from '../../../react/mixins/createStoreMixin';

import RoutesStore from '../../../stores/RoutesStore';
import {PATH_PREFIX} from '../routes';
import tableBrowserStore from '../flux/store';
import tableBrowserActions from '../flux/actions';
import createActionsProvisioning from '../actionsProvisioning';
import createStoreProvisioning from '../storeProvisioning';

export default createReactClass({

  mixins: [createStoreMixin(tablesStore, tableBrowserStore)],

  getStateFromStores() {
    const tableId  = tableBrowserStore.getCurrentTableId();
    const tables = tablesStore.getAll() || Map();
    const table = tables.get(tableId, Map());

    return {
      moreTables: List(), // context tables TBA
      tableId: tableId,
      table: table,
      actions: createActionsProvisioning(tableId),
      store: createStoreProvisioning(tableId)
    };
  },

  getLocalState(path) {
    return this.state.store.getLocalState(path);
  },

  componentWilUnmount() {
    this.state.actions.stopEventService();
  },

  render() {
    return (
      <span key="mainspan">
        {this.renderModal()}
      </span>
    );
  },

  renderModal() {
    return (
      <TableLinkModalDialog
        moreTables={this.state.moreTables.toArray()}
        tableId={this.state.tableId}
        reload={this.reload}
        tableExists={this.state.store.tableExists()}
        omitFetches={this.getLocalState('omitFetches')}
        omitExports={this.getLocalState('omitExports')}
        onHideFn={this.onHide}
        isLoading={this.state.store.isLoadingAll()}
        table={this.state.table}
        dataPreview={this.getLocalState('dataPreview')}
        dataPreviewError={this.getLocalState('dataPreviewError')}
        onOmitExportsFn={this.state.actions.setEventsFilter('omitExports')}
        onOmitFetchesFn={this.state.actions.setEventsFilter('omitFetches')}
        events={this.getLocalState('events')}
        onChangeTable={this.changeTable}
        filterIOEvents={this.getLocalState('filterIOEvents')}
        onFilterIOEvents={this.state.actions.setEventsFilter('filterIOEvents')}
        onShowEventDetail={(eventId) => this.state.actions.setLocalState({detailEventId: eventId})}
        detailEventId={this.getLocalState('detailEventId')}
      />
    );
  },

  redirectBack() {
    const routerState = RoutesStore.getRouterState();
    const currentPath = routerState.get('path') || '';
    const parts = currentPath.split(`/${PATH_PREFIX}/`);
    const backPath = parts ? parts[0] : '/';
    RoutesStore.getRouter().transitionTo(backPath || '/');
  },

  onHide() {
    this.state.actions.stopEventService();
    this.redirectBack();
  },

  reload() {
    Promise.props( {
      'loadAllTablesFore': storageActions.loadTablesForce(),
      'exportData': this.state.actions.exportDataSample(),
      'loadEvents': this.state.store.eventService.load()
    });
  },

  loadAll() {
    this.state.actions.exportDataSample();
    this.state.actions.startEventService();
  },

  changeTable(newTableId, dontLoadAll) {
    const initLocalState = fromJS({
      detailEventId: null,
      loadingPreview: false,
      dataPreview: Immutable.List(),
      dataPreviewError: null,
      events: Immutable.List()
    });
    tableBrowserActions.setCurrentTableId(newTableId, initLocalState);
    if (!dontLoadAll) {
      this.state.actions.resetTableEvents();
      this.loadAll();
    }
  }

});
