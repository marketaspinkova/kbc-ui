import Index from './react/pages/index/Index';
import actions from './wrGdriveActionCreators';
import authorizePage from './react/pages/authorize/Authorize';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import JobsActionCreators from '../jobs/ActionCreators';
import storageActionCreators from '../components/StorageActionCreators';
import { createTablesRoute } from '../table-browser/routes';

export default {
  name: 'wr-google-drive',
  isComponent: true,
  path: ':config',
  defaultRouteHandler: Index,
  poll: {
    interval: 7,
    action(params) {
      return JobsActionCreators.loadComponentConfigurationLatestJobs(
        'wr-google-drive',
        params.config
      );
    }
  },
  title(routerState) {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig('wr-google-drive', configId).get('name');
  },

  requireData: [
    (params) => actions.loadFiles(params.config),
    () => storageActionCreators.loadTables()
  ],
  childRoutes: [
    createTablesRoute('wr-google-drive'),
    {
      name: 'wr-google-drive-authorize',
      path: 'authorize',
      handler: authorizePage,
      title() {
        return 'Authorize Google Drive account';
      }
    }
  ]
};
