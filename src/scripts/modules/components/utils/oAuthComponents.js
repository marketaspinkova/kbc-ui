import InstalledComponentsActions from '../InstalledComponentsActionCreators';
import InstalledComponentsStore from '../stores/InstalledComponentsStore';

export default {
  loadComponentsWithOAuth: () => InstalledComponentsActions.loadComponents()
    .then(() => InstalledComponentsStore.getAll()
      .filter(component => component.get('flags').contains('genericDockerUI-authorization'))
      .map(component => InstalledComponentsActions.loadComponentConfigsData(component.get('id'))))
};
