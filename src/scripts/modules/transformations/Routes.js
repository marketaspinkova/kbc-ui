/* eslint-disable react/no-multi-comp */
// ^ due to false positive
import React from 'react';

import TransformationsIndex from './react/pages/transformations-index/TransformationsIndex';
import TransformationBucket from './react/pages/transformation-bucket/TransformationBucket';
import TransformationDetail from './react/pages/transformation-detail/TransformationDetail';
import TransformationGraph from './react/pages/transformation-graph/TransformationGraph';
import Sandbox from './react/pages/sandbox/Sandbox';
import InstalledComponentsActionCreators from './../components/InstalledComponentsActionCreators';
import VersionsActionCreators from '../components/VersionsActionCreators';
import ProvisioningActionCreators from '../provisioning/ActionCreators';
import StorageActionCreators from '../components/StorageActionCreators';
import TransformationsIndexReloaderButton from './react/components/TransformationsIndexReloaderButton';
import TransformationBucketButtons from './react/components/TransformationBucketButtons';
import TransformationBucketsStore from './stores/TransformationBucketsStore';
import TransformationsStore from './stores/TransformationsStore';
import createVersionsPageRoute from '../../modules/components/utils/createVersionsPageRoute';
import ComponentNameEdit from '../components/react/components/ComponentName';
import TransformationNameEdit from './react/components/TransformationNameEditField';
import ApplicationsStore from '../../stores/ApplicationStore';
import JobsActionCreators from '../jobs/ActionCreators';
import injectProps from '../components/react/injectProps';
import { createTablesRoute } from '../table-browser/routes';

const routes = {
  name: 'transformations',
  title: 'Transformations',
  defaultRouteHandler: TransformationsIndex,
  reloaderHandler: injectProps({ allowRefresh: true })(TransformationsIndexReloaderButton),
  headerButtonsHandler: TransformationBucketButtons,
  requireData: [
    () => InstalledComponentsActionCreators.loadComponentConfigsData('transformation'),
    () => InstalledComponentsActionCreators.loadComponents()
  ],
  childRoutes: [
    {
      name: 'transformationBucket',
      path: 'bucket/:config',
      title(routerState) {
        const configId = routerState.getIn(['params', 'config']);
        return TransformationBucketsStore.get(configId).get('name');
      },
      nameEdit(params) {
        if (parseInt(params.config, 10) > 0) {
          return (
            <span>
              <ComponentNameEdit componentId="transformation" configId={params.config} />
            </span>
          );
        } else {
          return TransformationBucketsStore.get(params.config).get('name');
        }
      },
      defaultRouteHandler: TransformationBucket,
      reloaderHandler: TransformationsIndexReloaderButton,
      requireData: [params => VersionsActionCreators.loadVersions('transformation', params.config)],
      poll: {
        interval: 10,
        action(params) {
          return JobsActionCreators.loadComponentConfigurationLatestJobs('transformation', params.config);
        }
      },

      childRoutes: [
        createVersionsPageRoute('transformation', 'config'),
        {
          name: 'transformationDetail',
          path: 'transformation/:row',
          title(routerState) {
            const configId = routerState.getIn(['params', 'config']);
            const transformationId = routerState.getIn(['params', 'row']);
            return TransformationsStore.getTransformation(configId, transformationId).get('name');
          },
          nameEdit(params) {
            if (parseInt(params.row, 10) > 0) {
              return (
                <span>
                  <TransformationNameEdit configId={params.config} rowId={params.row} />
                </span>
              );
            } else {
              return TransformationsStore.getTransformation(params.config, params.row).get('name');
            }
          },
          defaultRouteHandler: TransformationDetail,
          reloaderHandler: TransformationsIndexReloaderButton,
          requireData: [
            () => {
              StorageActionCreators.loadTables();
              return StorageActionCreators.loadBuckets();
            }
          ],
          childRoutes: [
            createTablesRoute('transformationDetail'),
            {
              name: 'transformationDetailGraph',
              path: 'graph',
              title() {
                return 'Overview';
              },
              defaultRouteHandler: TransformationGraph
            }
          ]
        }
      ]
    },
    {
      name: 'sandbox',
      title() {
        return 'Sandbox';
      },
      defaultRouteHandler: Sandbox,
      requireData: [
        () => ProvisioningActionCreators.loadMySqlSandboxCredentials(),
        () => {
          if (ApplicationsStore.getSapiToken().getIn(['owner', 'hasRedshift'])) {
            return ProvisioningActionCreators.loadRedshiftSandboxCredentials();
          }
        },
        () => {
          if (ApplicationsStore.getSapiToken().getIn(['owner', 'hasSnowflake'])) {
            return ProvisioningActionCreators.loadSnowflakeSandboxCredentials();
          }
        },
        () => ProvisioningActionCreators.loadRStudioSandboxCredentials(),
        () => ProvisioningActionCreators.loadJupyterSandboxCredentials(),
        () => StorageActionCreators.loadBuckets(),
        () => StorageActionCreators.loadTables()
      ]
    }
  ]
};

export default routes;
