import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';

const createUrl = path => {
  const baseUrl = ComponentsStore.getComponent('queue').get('uri');
  return `${baseUrl}/${path}`;
};

const createRequest = (method, path) =>
  request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default {
  getJobs() {
    return createRequest('GET', 'jobs')
      .promise()
      .then(response => response.body);
  },

  getJobsParametrized(query, limit, offset) {
    return createRequest('GET', 'jobs')
      .query({ q: query })
      .query({ limit: limit })
      .query({ offset: offset })
      .query({ include: 'metrics' })
      .promise()
      .then(response => response.body);
  },

  getJobDetail(jobId) {
    return createRequest('GET', `jobs/${jobId}?include=metrics`)
      .promise()
      .then(response => response.body);
  },

  terminateJob(jobId) {
    return createRequest('POST', `jobs/${jobId}/kill`)
      .promise()
      .then(response => response.body);
  }
};
