import request from '../../../utils/request';

function createUrl(path) {
  return '/graph/' + path;
}

function createRequest(token, method, path) {
  return request(method, createUrl(path))
    .set('X-StorageApi-Token', token);
}

const getLineageInOrganization = (token) => {
  return createRequest(token, 'GET', 'organization')
    .promise()
    .then(function(response) {
      return response.body;
    });
};

export {
  getLineageInOrganization
}
