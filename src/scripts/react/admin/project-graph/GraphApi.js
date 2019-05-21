import request from '../../../utils/request';

function createRequest(endpoint, token, method, path) {
  return request(method, endpoint + '/' + path)
    .set('X-StorageApi-Token', token);
}

const getLineageInOrganization = (endpoint, token) => {
  return createRequest(endpoint, token, 'GET', 'organization')
    .promise()
    .then((response) => response.body);
};

const getOrganizationReliability = (endpoint, token) => {
  return createRequest(endpoint, token, 'GET', 'organization/reliability')
    .promise()
    .then((response) => response.body);
};

const getProjectReliability = (endpoint, token) => {
  return createRequest(endpoint, token, 'GET', 'project/reliability')
    .promise()
    .then((response) => response.body);
};

const getActivityMatchingData = (endpoint, token) => {
  return createRequest(endpoint, token, 'GET', 'project/match')
    .promise()
    .then((response) => response.body);
}

export {
  getLineageInOrganization,
  getOrganizationReliability,
  getProjectReliability,
  getActivityMatchingData
}
