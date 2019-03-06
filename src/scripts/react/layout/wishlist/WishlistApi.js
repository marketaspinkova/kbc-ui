import request from '../../../utils/request';
import ApplicationStore from '../../../stores/ApplicationStore';

function createRequest(method, path) {
  return request(method, path).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
}

export default {
  sendRequest(params) {
    return createRequest('POST', '/admin/index/send-wishlist-request')
      .type('form')
      .send(params)
      .promise()
      .then((response) => {
        return response.body;
      });
  }
};
