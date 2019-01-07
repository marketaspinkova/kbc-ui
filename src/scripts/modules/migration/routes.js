import Index from './react/pages/Index';
import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import ComponentReloaderButton from '../components/react/components/ComponentsReloaderButton';

export default {
  name: 'migrations',
  title: 'Migrations',
  path: 'migrations',
  isComponent: true,
  defaultRouteHandler: Index,
  reloaderHandler: ComponentReloaderButton,
  requireData: [
    () => installedComponentsActions.loadComponentsForce()
  ],
  // poll: {
  //   interval: 10,
  //   action: () => installedComponentsActions.loadDeletedComponentsForce()
  // },
  childRoutes: [
  ]
};
