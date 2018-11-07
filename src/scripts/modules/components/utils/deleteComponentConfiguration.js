import componentHasApi from './hasComponentApi';
import installedComponentsApi from '../InstalledComponentsApi';
import syrupApi from '../SyrupComponentApi';
import componentsStore from '../stores/ComponentsStore';

export default (componentId, configurationId) => {
  const component = componentsStore.getComponent(componentId);

  if (
    componentHasApi(componentId) &&
    !component.get('flags').includes('genericUI') &&
    !component.get('flags').includes('genericDockerUI') &&
    !component.get('flags').includes('genericTemplatesUI')
  ) {
    return syrupApi
      .createRequest(componentId, 'DELETE', `configs/${configurationId}`)
      .promise()
      .then(() => installedComponentsApi.deleteConfiguration(componentId, configurationId));
  }

  return installedComponentsApi.deleteConfiguration(componentId, configurationId);
};
