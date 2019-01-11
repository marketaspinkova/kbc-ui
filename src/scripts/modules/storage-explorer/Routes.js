import Index from './react/pages/Index/Index';
import Files from './react/pages/Files/Files';
import Jobs from './react/pages/Jobs/Jobs';
import Table from './react/pages/Table/Table';
import Bucket from './react/pages/Bucket/Bucket';
import NavButtons from './react/components/NavButtons';
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
  headerButtonsHandler: NavButtons,
  requireData: [() => StorageActions.loadBuckets(), () => StorageActions.loadTables()],
  childRoutes: [
    {
      name: 'storage-explorer-files',
      path: 'files',
      defaultRouteHandler: Files,
      headerButtonsHandler: NavButtons,
      reloaderHandler: FilesReloaderButton,
      title: 'Files',
      requireData: [() => StorageActions.loadFilesForce({ limit: filesLimit })]
    },
    {
      name: 'storage-explorer-jobs',
      path: 'jobs',
      defaultRouteHandler: Jobs,
      headerButtonsHandler: NavButtons,
      reloaderHandler: JobsReloaderButton,
      title: 'Jobs',
      requireData: [() => StorageActions.loadJobs({ limit: jobsLimit })]
    },
    {
      name: 'storage-explorer-bucket',
      path: ':bucketId',
      defaultRouteHandler: Bucket,
      headerButtonsHandler: NavButtons,
      title(routerState) {
        return `Bucket ${routerState.getIn(['params', 'bucketId'])}`;
      },
      childRoutes: [
        {
          name: 'storage-explorer-table',
          path: ':tableName',
          defaultRouteHandler: Table,
          headerButtonsHandler: NavButtons,
          title(routerState) {
            const bucketId = routerState.getIn(['params', 'bucketId']);
            const tableName = routerState.getIn(['params', 'tableName']);
            const table = TablesStore.getAll().find(item => {
              return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
            });
            return table.get('name');
          }
        }
      ]
    }
  ]
};
