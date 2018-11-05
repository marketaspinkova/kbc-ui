import VersionsActionCreators from '../modules/components/VersionsActionCreators';
import InstalledComponentsActionCreators from '../modules/components/InstalledComponentsActionCreators';

export default (componentId, configId, version) => {
  return () => {
    const versionId = version.get('version');
    const reloadCallback = (component, config) => {
      const promises = [];
      if (componentId === 'transformation') {
        promises.push(InstalledComponentsActionCreators.loadComponentConfigsData(component));
      }
      promises.push(InstalledComponentsActionCreators.loadComponentConfigData(component, config));
      return promises;
    };
    VersionsActionCreators.rollbackVersion(componentId, configId, versionId, reloadCallback);
  };
};
