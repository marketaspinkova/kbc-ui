import Index from './react/Index';
import storageActions from '../components/StorageActionCreators';
import createActionsProvisioning from './actionsProvisioning';
import tableBrowserActions from './flux/actions';

export default {
  name: 'tablePreview',
  path: 'preview/:tableId',
  requireData: (routerState) => {
    return storageActions.loadTables().then(() => {
      const actions = createActionsProvisioning(routerState.tableId);
      tableBrowserActions.setCurrentTableId(routerState.tableId, actions.initLocalState());
      actions.loadAll();
    });
  },
  defaultRouteHandler: Index
};
