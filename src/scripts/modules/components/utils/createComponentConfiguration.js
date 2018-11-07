import installedComponentsApi from '../InstalledComponentsApi';
import syrupApi from '../SyrupComponentApi';
import { GoodDataWriterModes } from '../Constants';
import string from '../../../utils/string';
import ComponentsStore from '../stores/ComponentsStore';
import componentHasApi from './hasComponentApi';

const createConfigByApi = (componentId, configuration) =>
  syrupApi
    .createRequest(componentId, 'POST', 'configs')
    .send(configuration.set('name', string.webalize(configuration.get('name'))).toJS())
    .promise()
    .then(response => response.body);

// Custom create method for GoodData writer
const createGoodDataWriter = function(configuration) {
  const writerId = string.webalize(configuration.get('name'), { separator: '_' });
  const params = {
    writerId,
    description: configuration.get('description')
  };

  // create new
  if (configuration.get('mode') === GoodDataWriterModes.NEW) {
    params.authToken = configuration.get('authToken');
  }

  // create from existing
  if (configuration.get('mode') === GoodDataWriterModes.EXISTING) {
    params.pid = configuration.get('pid');
    params.username = configuration.get('username');
    params.password = configuration.get('password');
    params.readModel = configuration.get('readModel');
  }

  if (configuration.get('customDomain')) {
    params.domain = configuration.get('domain');
    params.username = configuration.get('username');
    params.password = configuration.get('password');
    params.backendUrl = configuration.get('backendUrl');
    params.ssoProvider = configuration.get('ssoProvider');
    params.ssoKey = configuration.get('ssoKey');
  }

  return syrupApi
    .createRequest('gooddata-writer', 'POST', 'v2')
    .send(params)
    .promise()
    .then(() => ({ id: writerId }));
};

export default (componentId, configuration) => {
  const component = ComponentsStore.getComponent(componentId);
  const flags = component.get('flags');

  if (componentId === 'gooddata-writer') {
    return createGoodDataWriter(configuration).then(response =>
      installedComponentsApi.createConfiguration(componentId, {
        name: configuration.get('name'),
        description: configuration.get('description'),
        configurationId: response.id
      })
    );
  }

  if (
    component.get('uri') &&
    componentHasApi(component.get('id')) &&
    !flags.includes('genericUI') &&
    !flags.includes('genericDockerUI') &&
    !flags.includes('genericTemplatesUI')
  ) {
    return createConfigByApi(componentId, configuration).then(response =>
      installedComponentsApi.createConfiguration(componentId, {
        name: configuration.get('name'),
        description: configuration.get('description'),
        configurationId: response.id
      })
    );
  }

  return installedComponentsApi.createConfiguration(componentId, {
    name: configuration.get('name'),
    description: configuration.get('description')
  });
};
