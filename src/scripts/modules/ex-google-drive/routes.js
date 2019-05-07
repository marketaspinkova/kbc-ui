import Index from './react/Index/Index';
// import SheetDetail from './react/SheetDetail/SheetDetail';
// import NewSheet from './react/NewSheet/NewSheet';
// import SheetDetailHeaderButtons from './react/SheetDetail/HeaderButtons';
// import NewSheetHeaderButtons from './react/NewSheet/HeaderButtons';

// import store from './storeProvisioning';
import jobsActionCreators from '../jobs/ActionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import * as oauthUtils from '../oauth-v2/OauthUtils';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import versionsActions from '../components/VersionsActionCreators';
import storageActions from '../components/StorageActionCreators';

const COMPONENT_ID = 'keboola.ex-google-drive';

export default {
  name: COMPONENT_ID,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  title: (routerState) => {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(COMPONENT_ID, configId).get('name');
  },
  // headerButtonsHandler: HeaderButtons,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(COMPONENT_ID, params.config).then(() => {
      return oauthUtils.loadCredentialsFromConfig(COMPONENT_ID, params.config);
    }),
    (params) => versionsActions.loadVersions(COMPONENT_ID, params.config),
    () => storageActions.loadTables()
  ],
  poll: {
    interval: 7,
    action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs(COMPONENT_ID, params.config)
  },
  childRoutes: [
    oauthUtils.createRedirectRouteSimple(COMPONENT_ID)
    // {
    //   name: COMPONENT_ID + '-sheet-detail',
    //   path: 'sheet/:sheetId',
    //   handler: SheetDetail,
    //   headerButtonsHandler: SheetDetailHeaderButtons,
    //   title: (routerState) => {
    //     const configId = routerState.getIn(['params', 'config']);
    //     const sheetId = routerState.getIn(['params', 'sheetId']);
    //     return store(configId).getConfigSheet(sheetId).get('name');
    //   }
    // },
    // {
    //   name: COMPONENT_ID + '-new-sheet',
    //   path: 'new-sheet',
    //   handler: NewSheet,
    //   headerButtonsHandler: NewSheetHeaderButtons,
    //   title: () => 'New Sheet'
    // }
  ]
};
