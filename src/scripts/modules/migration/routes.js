import Index from './react/pages/Index';
import InstalledComponentsActions from '../components/InstalledComponentsActionCreators';
import ComponentReloaderButton from '../components/react/components/ComponentsReloaderButton';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';

export default {
  name: 'migrations',
  title: 'Migrations',
  path: 'migrations',
  isComponent: true,
  defaultRouteHandler: Index,
  reloaderHandler: ComponentReloaderButton,
  requireData: [
    () => InstalledComponentsActions.loadComponents()
      .then(() => InstalledComponentsStore.getAll())
      .then(components => components.filter(component => {
        return component.get('flags').contains('genericDockerUI-authorization');
      }))
      .then(componentsWithOauth => componentsWithOauth.map(component => {
        return InstalledComponentsActions.loadComponentConfigsData(component.get('id'));
      }))
  ],
  // poll: {
  //   interval: 10,
  //   action: () => installedComponentsActions.loadDeletedComponentsForce()
  // },
  childRoutes: [
  ]
};
