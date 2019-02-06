import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';


const createUrl = path => `${ApplicationStore.getSapiUrl()}/v2/storage/${path}`;

const createRequest = (method, path) =>
  request(method, createUrl(path))
    .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default {
  listEvents(params) {
    return createRequest('GET', 'events')
      .query(params)
      .promise()
      .then(response => response.body);
  },

  listTableEvents(tableId, params) {
    return createRequest('GET', 'tables/' + tableId + '/events')
      .query(params)
      .promise()
      .then(response => response.body);
  },

  getEvent(id) {
    return createRequest('GET', `events/${id}`)
      .promise()
      .then(response => response.body);
  },

  listBucketEvents(buckedId, params) {
    return createRequest('GET', 'buckets/' + buckedId + '/events')
      .query(params)
      .promise()
      .then(response => response.body);
  }
};