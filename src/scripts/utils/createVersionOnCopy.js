import VersionsActionCreators from '../modules/components/VersionsActionCreators';
import InstalledComponentsActionCreators from '../modules/components/InstalledComponentsActionCreators';
import defaultCopyVersionName from './defaultCopyVersionName';

export default (componentId, configId, version, name) => {
  return () => {
    const versionId = version.get('version');
    const versionName = name || defaultCopyVersionName(version);
    const reloadCallback = (component) => {
      const promises = [];
      if (componentId === 'transformation') {
        promises.push(InstalledComponentsActionCreators.loadComponentConfigsData(component));
      }
      promises.push(InstalledComponentsActionCreators.loadComponentsForce());
      return promises;
    };
    VersionsActionCreators.copyVersion(componentId, configId, versionId, versionName, reloadCallback);
  };
};
