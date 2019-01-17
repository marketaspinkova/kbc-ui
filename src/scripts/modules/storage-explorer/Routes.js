import Index from './react/pages/Index/Index';
import Files from './react/pages/Files/Files';
import Jobs from './react/pages/Jobs/Jobs';
import Table from './react/pages/Table/Table';
import Bucket from './react/pages/Bucket/Bucket';
import FilesReloaderButton from './react/components/FilesReloaderButton';
import JobsReloaderButton from './react/components/JobsReloaderButton';
import StorageActions from '../components/StorageActionCreators';
import { filesLimit, jobsLimit } from './Constants';
import { loadFiles, updateFilesSearchQuery } from './Actions';

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
      requireData: [
        (params, query) => {
          const searchParams = { limit: filesLimit };

          if (query.q) {
            searchParams.q = query.q;
            updateFilesSearchQuery(query.q);
          }

          return loadFiles(searchParams);
        }
      ]
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
            return routerState.getIn(['params', 'tableName']);
          }
        }
      ]
    }
  ]
};
