import Index from './react/pages/Index/Index';
import Files from './react/pages/Files/Files';
import Jobs from './react/pages/Jobs/Jobs';
import Table from './react/pages/Table/Table';
import Documentation from './react/pages/Documentation/Documentation';
import Bucket from './react/pages/Bucket/Bucket';
import FilesReloaderButton from './react/components/FilesReloaderButton';
import JobsReloaderButton from './react/components/JobsReloaderButton';
import { filesLimit, jobsLimit } from './Constants';
import { loadBuckets, loadTables, loadSharedBuckets, loadJobs, loadFiles, updateFilesSearchQuery, loadLastDocumentationSnapshot } from './Actions';

export default {
  name: 'storage-explorer',
  title: 'Storage',
  defaultRouteHandler: Index,
  requireData: [
    () => loadBuckets(),
    () => loadTables(),
    () => loadSharedBuckets()
  ],
  childRoutes: [
    {
      name: 'storage-explorer-files',
      path: 'files',
      defaultRouteHandler: Files,
      reloaderHandler: FilesReloaderButton,
      title: 'Files',
      poll: {
        interval: 20,
        action(params, query) {
          const searchParams = { limit: filesLimit };

          if (query.q) {
            searchParams.q = query.q;
          }

          return loadFiles(searchParams);
        }
      },
      requireData: [
        (params, query) => {
          const searchParams = { limit: filesLimit };

          if (query.q || query.q === '') {
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
      poll: {
        interval: 20,
        action() {
          return loadJobs({ limit: jobsLimit })
        }
      },
      requireData: [() => loadJobs({ limit: jobsLimit })]
    },
    {
      name: 'storage-explorer-documentation',
      path: 'documentation',
      defaultRouteHandler: Documentation,
      title: 'Documentation',
      requireData: loadLastDocumentationSnapshot
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
