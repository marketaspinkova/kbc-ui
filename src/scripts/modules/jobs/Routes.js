import Promise from 'bluebird';
import JobDetail from './react/pages/job-detail/JobDetail';
import JobsIndex from './react/pages/jobs-index/JobsIndex';
import JobsActionCreators from './ActionCreators';
import JobsReloaderButton from './react/components/JobsReloaderButton';
import JobDetailReloaderButton from './react/components/JobDetailReloaderButton';
import JobDetailButtons from './react/components/JobDetailButtons';
import JobsStore from './stores/JobsStore';
import InstalledComponentsActionCreators from '../components/InstalledComponentsActionCreators';
import { getJobComponentId } from './utils';

export default {
  name: 'jobs',
  title: 'Jobs',
  path: 'jobs',
  defaultRouteHandler: JobsIndex,
  reloaderHandler: JobsReloaderButton,
  persistQueryParams: ['q'],
  poll: {
    interval: 10,
    action() {
      return JobsActionCreators.reloadJobs();
    }
  },
  requireData: [
    () => InstalledComponentsActionCreators.loadComponents(),
    (params, query) => {
      const currentQuery = JobsStore.getQuery();
      if (params.jobId) {
        // job detail
        return Promise.resolve();
      } else if ((query.q || query.q === '') && query.q !== currentQuery) {
        JobsActionCreators.setQuery(query.q || '');
        return JobsActionCreators.loadJobsForce(0, true, false);
      } else {
        return JobsActionCreators.loadJobs();
      }
    }
  ],

  childRoutes: [
    {
      name: 'jobDetail',
      path: ':jobId',
      persistQueryParams: ['q'],
      title(routerState) {
        const jobId = routerState.getIn(['params', 'jobId']);
        return `Job ${jobId}`;
      },
      reloaderHandler: JobDetailReloaderButton,
      isRunning(routerState) {
        const jobId = routerState.getIn(['params', 'jobId']);
        const job = JobsStore.get(parseInt(jobId, 10));
        return job && !job.get('isFinished');
      },
      defaultRouteHandler: JobDetail,
      headerButtonsHandler: JobDetailButtons,
      poll: {
        interval: 2,
        action(params) {
          const jobId = parseInt(params.jobId, 10);
          const job = JobsStore.get(jobId);
          if (job && ['waiting', 'processing', 'terminating'].includes(job.get('status'))) {
            return JobsActionCreators.loadJobDetailForce(jobId);
          }
        }
      },
      requireData: [
        params =>
          JobsActionCreators.loadJobDetail(parseInt(params.jobId, 10)).then(() => {
            const job = JobsStore.get(parseInt(params.jobId, 10));
            if (
              (job.get('component') === 'transformation' && job.hasIn(['params', 'transformations', 0]))
              || (job.get('component') === 'provisioning' && job.hasIn(['params', 'transformation']))
            ) {
              return InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
            }
            if (
              job.get('component') !== 'transformation' &&
              job.hasIn(['params', 'config']) &&
              job.hasIn(['params', 'row'])
            ) {
              return InstalledComponentsActionCreators.loadComponentConfigsData(getJobComponentId(job));
            }
          })
      ]
    }
  ]
};
