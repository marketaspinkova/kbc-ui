import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';

export default (tokenId) => {
  const createUrl = path => `${ApplicationStore.getSapiUrl()}/v2/storage/tokens/${tokenId}/${path}`;

  const createRequest = (method, path) =>
    request(method, createUrl(path))
      .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

  return {
    listEvents(params) {
      return createRequest('GET', 'events')
        .query(params)
        .timeout(10000)
        .promise()
        .then(response => response.body);
    },

    getEvent(id) {
      return createRequest('GET', `events/${id}`)
        .promise()
        .then(response => response.body);
    }
  };
};
