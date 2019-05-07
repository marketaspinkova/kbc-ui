import React from 'react';
import VersionsActionCreators from './VersionsActionCreators';
import createVersionsPageRoute from './utils/createVersionsPageRoute';
import IntalledComponentsStore from './stores/InstalledComponentsStore';
import SchemasActionsCreators from './TemplatesActionCreators';
import InstalledComponentsActions from './InstalledComponentsActionCreators';
import StorageActions from './StorageActionCreators';
import GenericDetail from './react/pages/GenericDetail';
import ComponentNameEdit from './react/components/ComponentName';
import { Routes } from './Constants';
import ComponentDetail from '../components/react/pages/component-detail/ComponentDetail';
import ComponentsStore from './stores/ComponentsStore';
import JobsActionCreators from '../jobs/ActionCreators';
import ComponentsActionCreators from './ComponentsActionCreators';
import * as OauthUtils from '../oauth-v2/OauthUtils';

export default componentType => {
  return {
    name: Routes.GENERIC_DETAIL_PREFIX + componentType,
    title(routerState) {
      const componentId = routerState.getIn(['params', 'component']);
      return ComponentsStore.getComponent(componentId).get('name');
    },
    path: ':component',
    defaultRouteHandler: ComponentDetail,
    requireData(params) {
      return ComponentsActionCreators.loadComponent(params.component);
    },
    childRoutes: [
      {
        name: `generic-detail-${componentType}-config`,
        title(routerState) {
          const configId = routerState.getIn(['params', 'config']);
          const component = routerState.getIn(['params', 'component']);
          return IntalledComponentsStore.getConfig(component, configId).get('name');
        },
        nameEdit(params) {
          return (
            <span>
              <ComponentNameEdit componentId={params.component} configId={params.config} />
            </span>
          );
        },
        defaultRouteHandler: GenericDetail,
        path: ':config',
        isComponent: true,
        requireData: [
          params =>
            InstalledComponentsActions.loadComponentConfigData(params.component, params.config).then(function() {
              if (
                ComponentsStore.getComponent(params.component)
                  .get('flags')
                  .includes('genericDockerUI-authorization')
              ) {
                return OauthUtils.loadCredentialsFromConfig(params.component, params.config);
              }
            }),

          () => StorageActions.loadTables(),
          () => StorageActions.loadBuckets(),
          params => VersionsActionCreators.loadVersions(params.component, params.config),
          params => SchemasActionsCreators.loadSchema(params.component)
        ],
        poll: {
          interval: 10,
          action(params) {
            return JobsActionCreators.loadComponentConfigurationLatestJobs(params.component, params.config);
          }
        },
        childRoutes: [
          createVersionsPageRoute(null, 'config', componentType + '-versions'),
          OauthUtils.createRedirectRoute(
            `generic-${componentType}-oauth-redirect`,
            `generic-detail-${componentType}-config`,
            params => ({ component: params.component, config: params.config })
          )
        ]
      }
    ]
  };
};
