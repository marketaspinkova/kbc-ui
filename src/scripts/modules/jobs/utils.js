import JobsStore from './stores/JobsStore';

const getJobComponentId = (job) => {
  return job.getIn(['params', 'component'], job.get('component'));
};

const getUserConfiguredJob = (configurationJob) => {
  let job = configurationJob;

  if (job.get('nestingLevel') > 0 && !job.hasIn(['params', 'config'])) {
    const runIdParts = job.get('runId', []).split('.');
    let parentRunId = '';
    let parentJob = null;

    for (let index = 1; index <= runIdParts.length; index++) {
      parentRunId = runIdParts.slice(0, index * -1).join('.');
      parentJob = JobsStore.getAll().find((job) => {
        return job.get('runId') === parentRunId && job.hasIn(['params', 'config']);
      });

      if (parentJob && parentJob.count() > 0) {
        job = parentJob;
        break;
      }
    }
  }

  return job;
};

export { getJobComponentId, getUserConfiguredJob };
