import dispatcher from '../Dispatcher';
import * as constants from '../constants/KbcConstants';

export default {
  routesConfigurationReceive(routes) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ROUTER_ROUTES_CONFIGURATION_RECEIVE,
      routes
    });
  },

  routeChangeStart(newRouterState) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ROUTER_ROUTE_CHANGE_START,
      routerState: newRouterState
    });
  },

  routeChangeSuccess(routerState) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ROUTER_ROUTE_CHANGE_SUCCESS,
      routerState
    });
  },

  routeChangeError(error) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ROUTER_ROUTE_CHANGE_ERROR,
      error
    });
  },

  routerCreated(router) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.ROUTER_ROUTER_CREATED,
      router
    });
  }
};
