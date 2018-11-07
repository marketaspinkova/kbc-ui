import ComponentsStore from './stores/ComponentsStore';
import ApplicationStore from '../../stores/ApplicationStore';
import request from '../../utils/request';

const _getComponentUrl = componentId => {
  const component = ComponentsStore.getComponent(componentId);
  if (!component) {
    throw new Error(`Component '${componentId}' not found`);
  }
  return component.get('uri');
};

export default {
  /*
  params:
  component: id of component
  data: run parameters
  method: run method
  */
  run(params) {
    return request('POST', _getComponentUrl(params.component) + '/' + params.method)
      .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString())
      .send(params.data)
      .promise()
      .then(response => response.body);
  }
};
