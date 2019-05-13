import { List } from 'immutable';
import InstalledComponentsActions from '../InstalledComponentsActionCreators';
import InstalledComponentsStore from '../stores/InstalledComponentsStore';

export default {
  loadComponentsWithOAuth: () => InstalledComponentsActions.loadComponents()
    .then(() => InstalledComponentsStore.getAll()
      .filter(component => component.get('flags', List()).contains('genericDockerUI-authorization') || component.get('id') === 'tde-exporter')
      .map(component => InstalledComponentsActions.loadComponentConfigsData(component.get('id'))))
};
