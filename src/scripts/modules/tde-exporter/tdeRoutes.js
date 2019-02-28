import _ from 'underscore';
import { List, Map } from 'immutable';
import moment from 'moment';
import Promise from 'bluebird';
import index from './react/pages/Index/Index';
import tableDetail from './react/pages/Table/Table';
import destinationPage from './react/pages/Destination/Destination';
import tableEditButtons from './react/components/TableHeaderButtons';
import JobsActionCreators from '../jobs/ActionCreators';
import LatestJobsStore from '../jobs/stores/LatestJobsStore';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import oauth2Actions from '../oauth-v2/ActionCreators';
import { OAUTH_V2_WRITERS } from './tdeCommon';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import storageActionCreators from '../components/StorageActionCreators';
import RouterStore from '../../stores/RoutesStore';
import VersionsActionCreators from '../components/VersionsActionCreators';
import { createTablesRoute } from '../table-browser/routes';
import {Constants} from '../oauth-v2/Constants';

const componentId = 'tde-exporter';

const registerOAuthV2Route = writerComponentId => ({
  name: `tde-oauth-v2-redirect-${writerComponentId}`,
  path: `oauth-redirect-${writerComponentId}`,
  title() {
    return 'Verifying authorization...';
  },
  requireData: [
    params =>
      installedComponentsActions.loadComponentConfigData(componentId, params.config).then(() => {
        const configuration = InstalledComponentsStore.getConfigData(componentId, params.config);
        const credentialsId = `tde-${params.config}`;
        const router = RouterStore.getRouter();

        return oauth2Actions
          .loadCredentials(writerComponentId, credentialsId)
          .then(() => {
            const saveFn = installedComponentsActions.saveComponentConfigData;
            const credentialsObject = Map(
              {
                id: credentialsId,
                version: Constants.OAUTH_VERSION_3
              }
            );
            const newConfig = configuration.setIn(['parameters', writerComponentId], credentialsObject);

            return saveFn(componentId, params.config, newConfig).then(() => {
              const notification = 'Account succesfully authorized.';
              ApplicationActionCreators.sendNotification({
                message: notification
              });

              return router.transitionTo(`${componentId}-destination`, { config: params.config });
            });
          })
          .error(() => {
            ApplicationActionCreators.sendNotification({
              message:
                'Failed to verify the authorized account, please contact us using the Support button in the menu on the left.',
              type: 'error'
            });

            return router.transitionTo(componentId, { config: params.config });
          });
      })
  ]
});
// return first non empty(aka authorized) writer account
const findNonEmptyAccount = configData => {
  for (let account of ['tableauServer', 'dropbox', 'gdrive']) {
    const data = configData.getIn(['parameters', account]);

    if (!_.isEmpty(data && data.toJS())) {
      return account;
    }
  }

  return null;
};

// load files from file uploads
const loadFiles = force => {
  const tags = ['tde', 'table-export'];
  const params = { q: _.map(tags, t => `+tags:${t}`).join(' ') };

  if (force) {
    return storageActionCreators.loadFilesForce(params);
  }

  return storageActionCreators.loadFiles(params);
};

// reload files from files uploads if at least one job has finished up to 10 seconds ago
const reloadSapiFilesTrigger = jobs => {
  const tresholdTrigger = 20; // seconds of end time from now to reload all files
  for (let job of jobs) {
    if (job.endTime) {
      const endTime = moment(job.endTime);
      const now = moment();
      const diff = moment.duration(now.diff(endTime));
      if (diff < moment.duration(tresholdTrigger, 'seconds')) {
        return loadFiles(true);
      }
    }
  }
};

// migrate tasks that have and uploadTasks set but no stageTask
// setup first non empty authorized account if uploadTasks is empty
const migrateUploadTasks = (configData, configId) => {
  const uploadTasks = configData.getIn(['parameters', 'uploadTasks'], List());
  let stageTask = configData.getIn(['parameters', 'stageUploadTask']);
  // migrate only if stageTask is not set
  if (!stageTask) {
    let newConfig = configData;
    if (uploadTasks.count() > 0) {
      stageTask = uploadTasks.first();
      newConfig = configData.setIn(['parameters', 'stageUploadTask'], stageTask);
      newConfig = configData;
    } else {
      const newTask = findNonEmptyAccount(configData);
      if (newTask) {
        newConfig = configData.setIn(['parameters', 'stageUploadTask'], newTask);
      }
    }
    // if data has changed then update
    if (newConfig !== configData) {
      installedComponentsActions.saveComponentConfigData(componentId, configId, newConfig);
    }
  }
};

export default {
  name: componentId,
  path: ':config',
  defaultRouteHandler: index,
  isComponent: true,
  poll: {
    interval: 15,
    action: (params) => {
      JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config).then(() => {
        const jobs = LatestJobsStore.getJobs(componentId, params.config);
        return reloadSapiFilesTrigger(jobs.get('jobs') && jobs.get('jobs').toJS());
      });
      VersionsActionCreators.reloadVersions(componentId, params.config);
    }
  },
  requireData: [
    params =>
      installedComponentsActions.loadComponentConfigData(componentId, params.config).then(() => {
        const configData = InstalledComponentsStore.getConfigData(componentId, params.config);
        return migrateUploadTasks(configData, params.config);
      }),
    () => storageActionCreators.loadTables(),
    () => loadFiles(false),
    params => VersionsActionCreators.loadVersions(componentId, params.config)
  ],
  title(routerState) {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(componentId, configId).get('name');
  },
  childRoutes: [
    createTablesRoute(componentId),
    {
      name: `${componentId}-table`,
      path: 'table/:tableId',
      handler: tableDetail,
      headerButtonsHandler: tableEditButtons,
      title(routerState) {
        return routerState.getIn(['params', 'tableId']);
      }
    },
    {
      name: `${componentId}-destination`,
      path: 'destination',
      defaultRouteHandler: destinationPage,
      requireData: [
        params =>
          installedComponentsActions.loadComponentConfigData(componentId, params.config).then(() => {
            const configData = InstalledComponentsStore.getConfigData(componentId, params.config);
            const parameters = configData.get('parameters', Map());

            return Promise.props(
              OAUTH_V2_WRITERS.map(cid => {
                const credentialsId = parameters.getIn([cid, 'id']);
                return !!credentialsId && oauth2Actions.loadCredentials(cid, credentialsId);
              })
            );
          })
      ],
      title() {
        return 'Setup Upload';
      },
      childRoutes: OAUTH_V2_WRITERS.map(wid => registerOAuthV2Route(wid))
    }
  ]
};
