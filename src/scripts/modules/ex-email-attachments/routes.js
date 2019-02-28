import Index from './react/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';

const componentId = 'keboola.ex-email-attachments';

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  defaultRouteHandler: Index,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData(componentId, params.config),
    (params) => versionsActions.loadVersions(componentId, params.config)
  ],
  poll: {
    interval: 15,
    action: (params) => {
      jobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
      versionsActions.reloadVersions(componentId, params.config)
    }
  }
};
