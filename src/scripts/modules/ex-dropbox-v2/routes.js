import Index from './react/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import jobsActionCreators from '../jobs/ActionCreators';
import versionsActions from '../components/VersionsActionCreators';

export default {
  name: 'radektomasek.ex-dropbox-v2',
  path: ':config',
  isComponent: true,
  requireData: [
    (params) => installedComponentsActions.loadComponentConfigData('radektomasek.ex-dropbox-v2', params.config),
    (params) => versionsActions.loadVersions('radektomasek.ex-dropbox-v2', params.config)
  ],
  poll: {
    interval: 7,
    action: (params) => jobsActionCreators.loadComponentConfigurationLatestJobs('radektomasek.ex-dropbox-v2', params.config)
  },
  defaultRouteHandler: Index
};
