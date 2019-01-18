import Index from './react/pages/Index';
import InstalledComponentsActions from '../components/InstalledComponentsActionCreators';
import ComponentReloaderButton from '../components/react/components/ComponentsReloaderButton';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';

function loadComponentsWithOauth() {
  return InstalledComponentsActions.loadComponents()
    .then(() => InstalledComponentsStore.getAll().filter(component => {
      return component.get('flags').contains('genericDockerUI-authorization');
    }))
    .then(componentsWithOauth => componentsWithOauth.map(component => {
      return InstalledComponentsActions.loadComponentConfigsData(component.get('id'));
    }));
}

export default {
  name: 'migrations',
  title: 'Migrations',
  path: 'migrations',
  isComponent: true,
  defaultRouteHandler: Index,
  reloaderHandler: ComponentReloaderButton,
  requireData: [
    () => loadComponentsWithOauth()
  ],
  poll: {
    interval: 10,
    action: () => loadComponentsWithOauth()
  },
  childRoutes: [
  ]
};
