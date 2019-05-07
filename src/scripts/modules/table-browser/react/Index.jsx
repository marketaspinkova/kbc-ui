import React from 'react';
import createReactClass from 'create-react-class';
import Promise from 'bluebird';
import { Map } from 'immutable';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../stores/RoutesStore';
import storageActions from '../../components/StorageActionCreators';
import tablesStore from '../../components/stores/StorageTablesStore';
import createActionsProvisioning from '../actionsProvisioning';
import createStoreProvisioning from '../storeProvisioning';
import tableBrowserStore from '../flux/store';
import TableLinkModalDialog from './components/ModalDialog';

export default createReactClass({
  mixins: [createStoreMixin(tablesStore, tableBrowserStore)],

  getStateFromStores() {
    const tableId  = tableBrowserStore.getCurrentTableId();
    const tables = tablesStore.getAll() || Map();
    const table = tables.get(tableId, Map());

    return {
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
        filterIOEvents={this.getLocalState('filterIOEvents')}
        onFilterIOEvents={this.state.actions.setEventsFilter('filterIOEvents')}
        onShowEventDetail={(eventId) => this.state.actions.setLocalState({detailEventId: eventId})}
        detailEventId={this.getLocalState('detailEventId')}
      />
    );
  },

  onHide() {
    this.state.actions.stopEventService();
    RoutesStore.getRouter().transitionTo(RoutesStore.getPreviousPathname() || '/');
  },

  reload() {
    Promise.all([
      storageActions.loadTablesForce(),
      this.state.actions.exportDataSample(),
      this.state.store.eventService.load()
    ]);
  }
});
