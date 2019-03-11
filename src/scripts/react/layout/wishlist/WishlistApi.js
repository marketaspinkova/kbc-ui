import request from '../../../utils/request';
import ApplicationStore from '../../../stores/ApplicationStore';
import AdminActionError from '../../../utils/AdminActionError';

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
      .promise()
      .then(
        () => {
          // this is empty, because successful action doesn't return any data
        },
        (error) => {
          if (error.response && error.response.body && error.response.body.errors) {
            throw new AdminActionError(error.response.body.errors);
          }
          throw error;
        }
      );
  }
};
