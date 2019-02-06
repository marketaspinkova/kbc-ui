import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';

const createUrl = path => {
  const baseUrl = ComponentsStore.getComponent('orchestrator').get('uri');
  return `${baseUrl}/${path}`;
};

const createRequest = (method, path) =>
  request(method, createUrl(path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default {
  createOrchestration(data) {
    return createRequest('POST', 'orchestrations')
      .send(data)
      .promise()
      .then(response => response.body);
  },

  getOrchestrations() {
    return createRequest('GET', 'orchestrations')
      .promise()
      .then(response => response.body);
  },

  getOrchestration(id) {
    return createRequest('GET', `orchestrations/${id}`)
      .promise()
      .then(response => response.body);
  },

  deleteOrchestration(id) {
    return createRequest('DELETE', `orchestrations/${id}`).promise();
  },

  runOrchestration(data) {
    return createRequest('POST', 'run')
      .send(data)
      .promise()
      .then(response => response.body);
  },

  updateOrchestration(id, data) {
    return createRequest('PUT', `orchestrations/${id}`)
      .send(data)
      .promise()
      .then(response => response.body);
  },

  saveOrchestrtionNotifications(id, notifications) {
    return createRequest('PUT', `orchestrations/${id}/notifications`)
      .send(notifications)
      .promise()
      .then(response => response.body);
  },

  saveOrchestrationTasks(id, tasks) {
    return createRequest('PUT', `orchestrations/${id}/tasks`)
      .send(tasks)
      .promise()
      .then(response => response.body);
  },

  getOrchestrationJobs(id) {
    return createRequest('GET', `orchestrations/${id}/jobs`)
      .promise()
      .then(response => response.body);
  },

  getJob(id) {
    return createRequest('GET', `jobs/${id}`)
      .promise()
      .then(response => response.body);
  },

  retryJob(jobId, tasks) {
    return createRequest('POST', `jobs/${jobId}/retry`)
      .send({
        tasks
      })
      .promise()
      .then(response => response.body);
  }
};
