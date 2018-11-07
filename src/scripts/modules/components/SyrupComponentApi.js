import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../components/stores/ComponentsStore';

const createUrl = (componentId, path) => ComponentsStore.getComponent(componentId).get('uri') + '/' + path;

const createRequest = (componentId, method, path) =>
  request(method, createUrl(componentId, path)).set('X-StorageApi-Token', ApplicationStore.getSapiTokenString());

export default { createRequest };
