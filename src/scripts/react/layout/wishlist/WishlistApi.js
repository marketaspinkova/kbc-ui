import request from '../../../utils/request';
import ApplicationStore from '../../../stores/ApplicationStore';

var createUrl = function(path) {
  return ApplicationStore.getSapiUrl() + path;
};


function createRequest(method, path) {
  return request(method, createUrl(path));
}

export default {
  sendRequest(params) {
    return createRequest('POST', '/admin/index/send-wishlist-request')
      .type('form')
      .send({...params, xsrf: ApplicationStore.getXsrfToken()})
      .promise();
  }
};
