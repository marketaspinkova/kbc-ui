import IndexLegacyCompatibilityWrapper from '../react/pages/IndexLegacyCompatibilityWrapper';
import Row from '../react/pages/Row';
import Versions from '../react/pages/Versions';
import installedComponentsActions from '../../components/InstalledComponentsActionCreators';
import storageActions from '../../components/StorageActionCreators';
import versionsActions from '../../components/VersionsActionCreators';
import rowVersionsActions from '../RowVersionsActionCreators';
import jobsActions from '../../jobs/ActionCreators';
import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';
import ComponentsStore from '../../components/stores/ComponentsStore';
import ConfigurationRowsStore from '../ConfigurationRowsStore';
import _ from 'lodash';
import fuzzy from 'fuzzy';
import Immutable from 'immutable';
import {createTablesRoute} from '../../table-browser/routes';
import {loadCredentialsFromConfig as loadOauthCredentials} from '../../oauth-v2/OauthUtils';

// defaults
const defaults = {
  legacyUI: {
    isMigrated: function() {
      return true;
    }
  },
  index: {},
  row: {
    hasState: false,
    name: {
      singular: 'Table',
      plural: 'Tables'
    },
    detail: {
      onCreate: function() {
        return Immutable.fromJS({});
      }
    },
    columns: [],
    searchFilter: function(row, query) {
      return fuzzy.test(query, row.get('name')) || fuzzy.test(query, row.get('description'));
    }
  }
};

export default function(settings) {
  const settingsWithDefaults = _.defaultsDeep(settings, defaults);
  let route = {
    name: settingsWithDefaults.componentId,
    settings: settingsWithDefaults,
    path: ':config',
    title: (routerState) => {
      const configId = routerState.getIn(['params', 'config']);
      return InstalledComponentsStore.getConfig(settingsWithDefaults.componentId, configId).get('name');
    },
    isComponent: true,
    defaultRouteHandler: IndexLegacyCompatibilityWrapper,
    poll: {
      interval: 10,
      action: (params) => jobsActions.loadComponentConfigurationLatestJobs(settingsWithDefaults.componentId, params.config)
    },
    requireData: [
      (params) => installedComponentsActions.loadComponentConfigData(settingsWithDefaults.componentId, params.config).then(function() {
        if (ComponentsStore.getComponent(settingsWithDefaults.componentId).get('flags').includes('genericDockerUI-authorization')) {
          return loadOauthCredentials(settingsWithDefaults.componentId, params.config);
        }
      }),
      (params) => versionsActions.loadVersions(settingsWithDefaults.componentId, params.config)
    ],
    childRoutes: []
  };
  route.childRoutes.push(
    {
      name: settingsWithDefaults.componentId + '-row',
      settings: settingsWithDefaults,
      path: 'rows/:row',
      title: (routerState) => {
        const configId = routerState.getIn(['params', 'config']);
        const rowId = routerState.getIn(['params', 'row']);
        const configurationRow = ConfigurationRowsStore.get(settingsWithDefaults.componentId, configId, rowId);
        return configurationRow.get('name') !== '' ? configurationRow.get('name') : 'Untitled ' + settingsWithDefaults.row.name.singular;
      },
      requireData: [
        (params) => rowVersionsActions.loadVersions(settingsWithDefaults.componentId, params.config, params.row),
        () => storageActions.loadTables()
      ],
      defaultRouteHandler: Row,
      childRoutes: [
        createTablesRoute(settingsWithDefaults.componentId + '-row'),
        {
          name: settingsWithDefaults.componentId + '-row-versions',
          settings: settingsWithDefaults,
          path: 'versions',
          title: 'Versions',
          defaultRouteHandler: Versions
        }
      ]
    }
  );
  return route;
}
