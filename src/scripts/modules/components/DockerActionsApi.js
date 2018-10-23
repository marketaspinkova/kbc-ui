// https://developers.keboola.com/extend/common-interface/actions/

import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';

function createUrl(componentId, action) {
  const dockerActionsUri = ApplicationStore.getKbcVars().get('dockerRunnerUrl');
  return `${dockerActionsUri}/docker/${componentId}/action/${action}`;
}

function createRequest(method, url) {
  return request(method, url)
    .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());
}

export default function(componentId, action, body) {
  const url = createUrl(componentId, action);
  return createRequest('POST', url)
    .send(body)
    .promise()
    .then(
      (response) => response.body
    );
}
