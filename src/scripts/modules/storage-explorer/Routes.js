import { Map } from 'immutable';
import Index from './react/pages/Index/Index';
import Files from './react/pages/Files/Files';
import Jobs from './react/pages/Jobs/Jobs';
import Table from './react/pages/Table/Table';
import Bucket from './react/pages/Bucket/Bucket';
import FilesReloaderButton from './react/components/FilesReloaderButton';
import JobsReloaderButton from './react/components/JobsReloaderButton';
import StorageActions from '../components/StorageActionCreators';
import TablesStore from '../components/stores/StorageTablesStore';
import { filesLimit } from './Constants';
import { jobsLimit } from './Constants';

export default {
  name: 'storage-explorer',
  title: 'Storage Explorer',
  defaultRouteHandler: Index,
  requireData: [() => StorageActions.loadBuckets(), () => StorageActions.loadTables()],
  childRoutes: [
    {
      name: 'storage-explorer-files',
      path: 'files',
      defaultRouteHandler: Files,
      reloaderHandler: FilesReloaderButton,
      title: 'Files',
      requireData: [() => StorageActions.loadFilesForce({ limit: filesLimit })]
    },
    {
      name: 'storage-explorer-jobs',
      path: 'jobs',
      defaultRouteHandler: Jobs,
      reloaderHandler: JobsReloaderButton,
      title: 'Jobs',
      requireData: [() => StorageActions.loadJobs({ limit: jobsLimit })]
    },
    {
      name: 'storage-explorer-bucket',
      path: ':bucketId',
      defaultRouteHandler: Bucket,
      title(routerState) {
        return `Bucket ${routerState.getIn(['params', 'bucketId'])}`;
      },
      childRoutes: [
        {
          name: 'storage-explorer-table',
          path: ':tableName',
          defaultRouteHandler: Table,
          title(routerState) {
            const bucketId = routerState.getIn(['params', 'bucketId']);
            const tableName = routerState.getIn(['params', 'tableName']);
            const table = TablesStore.getAll().find(item => {
              return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
            }, null, Map());
            return table.get('name', tableName);
          }
        }
      ]
    }
  ]
};
