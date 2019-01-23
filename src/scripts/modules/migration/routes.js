import Index from './react/pages/Index';
import ComponentReloaderButton from '../components/react/components/ComponentsReloaderButton';
import oAuthComponents from '../components/utils/oAuthComponents';

export default {
  name: 'migrations',
  title: 'Migrations',
  path: 'migrations',
  isComponent: true,
  defaultRouteHandler: Index,
  reloaderHandler: ComponentReloaderButton,
  requireData: [
    () => oAuthComponents.loadComponentsWithOAuth()
  ],
  poll: {
    interval: 10,
    action: () => oAuthComponents.loadComponentsWithOAuth()
  },
  childRoutes: [
  ]
};
