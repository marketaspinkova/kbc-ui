import Index from './react/pages/Index';
import oAuthComponents from '../components/utils/oAuthComponents';

export default {
  name: 'migrations',
  title: 'Migrations',
  path: 'migrations',
  isComponent: true,
  defaultRouteHandler: Index,
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
