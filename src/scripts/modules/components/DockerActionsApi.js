// https://developers.keboola.com/extend/common-interface/actions/

import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ServicesStore from '../services/Store';

function createUrl(componentId, action) {
  const dockerActionsUri = ServicesStore.getService('docker-runner').get('url');
  return `${dockerActionsUri}/docker/${componentId}/action/${action}`;
}

function createRequest(method, url) {
  return request(method, url)
    .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
}

export default function(componentId, action, body) {
  return unhandledRequest(componentId, action, body)
    .catch((err) => {
      if (err.response) {
        return err.response.body;
      } else {
        return err;
      }
    });
}

export function unhandledRequest(componentId, action, body) {
  const url = createUrl(componentId, action);
  return createRequest('POST', url)
    .send(body)
    .promise()
    .then(
      (response) => response.body
    );
}
