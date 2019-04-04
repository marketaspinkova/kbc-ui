import Dispatcher from '../Dispatcher';
import _ from 'underscore';
import { Map, List, fromJS } from 'immutable';
import { createPresentationalError } from '../utils/errors/helpers';
import Error from '../utils/errors/Error';
import StoreUtils from '../utils/StoreUtils';
import JobsStore from '../modules/jobs/stores/JobsStore';
import { ActionTypes as ComponentsConstants, Routes } from '../modules/components/Constants';
import * as Constants from '../constants/KbcConstants';
import { ActionTypes as JobsActionTypes } from '../modules/jobs/Constants';

let _store = Map({
  router: null,
  isPending: false,
  routerState: Map(),
  routesByName: Map(),
  breadcrumbs: List()
});

const genericDetailRoutesNames = ['extractor', 'writer', 'application'].map(
  componentType => Routes.GENERIC_DETAIL_PREFIX + componentType + '-config'
);

/*
  Converts nested routes structure to flat Map indexed by route name
*/
const nestedRoutesToByNameMap = route => {
  const map = {};
  const traverse = r => {
    if (r.name) {
      map[r.name] = r;
    }

    if (r.childRoutes) {
      return r.childRoutes.forEach(traverse);
    }
  };

  traverse(route);
  return fromJS(map);
};

const getRoute = (store, routeName) => {
  let route = store.getIn(['routesByName', routeName]);

  if (!route) {
    route = store.get('routesByName').find(r => r.get('defaultRouteName') === routeName);
  }

  return route;
};

/*
 Returns title for route
*/
const getRouteTitle = (store, routeName) => {
  const route = getRoute(store, routeName);
  const title = route ? route.get('title') : '';

  if (_.isFunction(title)) {
    return title(store.get('routerState'));
  }

  return title;
};

const getRouteSettings = (store, routeName) => {
  const route = getRoute(store, routeName);

  if (!route) {
    return Map();
  }

  return route.get('settings');
};

const getRouteIsRunning = (store, routeName) => {
  const route = getRoute(store, routeName);
  const isRunning = route ? route.get('isRunning') : false;

  if (_.isFunction(isRunning)) {
    return isRunning(store.get('routerState'));
  }

  return isRunning;
};

const getCurrentRouteName = store => {
  const routes = store.getIn(['routerState', 'routes'], List());
  const route = routes.findLast(r => !!r.get('name'));

  if (!route) {
    return null;
  }

  return route.get('name');
};

const generateBreadcrumbs = store => {
  if (store.has('error')) {
    return List.of(
      Map({
        name: 'error',
        title: store.get('error').getTitle()
      })
    );
  }

  const currentParams = store.getIn(['routerState', 'params']);

  return store
    .getIn(['routerState', 'routes'], List())
    .shift()
    .filter(route => !!route.get('name'))
    .map(route =>
      Map({
        title: getRouteTitle(store, route.get('name')),
        name: route.get('name'),
        link: Map({
          to: route.get('name'),
          params: currentParams
        })
      })
    );
};

const RoutesStore = StoreUtils.createStore({
  isError() {
    return _store.has('error');
  },

  getRouter() {
    return _store.get('router');
  },

  getBreadcrumbs() {
    return _store.get('breadcrumbs');
  },

  getCurrentRouteConfig() {
    return getRoute(_store, getCurrentRouteName(_store));
  },

  getRouterState() {
    return _store.get('routerState');
  },

  getComponentId(defaultValue) {
    if (this.getRouterState().hasIn(['params', 'component'])) {
      return this.getRouterState().getIn(['params', 'component']);
    }
    if (this.getRouterState().hasIn(['params', 'componentId'])) {
      return this.getRouterState().getIn(['params', 'componentId']);
    }
    const settings = this.getRouteSettings();
    if (settings && settings.has('componentId')) {
      return settings.get('componentId');
    }
    return defaultValue;
  },

  getConfigId(defaultValue) {
    if (this.getRouterState().hasIn(['params', 'config'])) {
      return this.getRouterState().getIn(['params', 'config']);
    }
    if (this.getRouterState().hasIn(['params', 'configId'])) {
      return this.getRouterState().getIn(['params', 'configId']);
    }
    return defaultValue;
  },

  getRowId(defaultValue) {
    if (this.getRouterState().hasIn(['params', 'row'])) {
      return this.getRouterState().getIn(['params', 'row']);
    }
    return defaultValue;
  },

  getOrchestrationId(defaultValue) {
    if (this.getRouterState().hasIn(['params', 'orchestrationId'])) {
      return this.getRouterState().getIn(['params', 'orchestrationId']);
    }
    return defaultValue;
  },

  getCurrentRouteParam(paramName, defaultValue = null) {
    if (paramName === 'config' || paramName === 'configId') {
      return this.getConfigId(defaultValue);
    }

    if (paramName === 'component' || paramName === 'componentId') {
      return this.getComponentId(defaultValue);
    }

    if (paramName === 'orchestrationId') {
      return this.getOrchestrationId(defaultValue);
    }

    return this.getRouterState().getIn(['params', paramName], defaultValue);
  },

  getCurrentRouteIntParam(paramName) {
    return parseInt(this.getCurrentRouteParam(paramName), 10);
  },

  getCurrentRouteTitle() {
    return getRouteTitle(_store, getCurrentRouteName(_store));
  },

  getCurrentRouteIsRunning() {
    return getRouteIsRunning(_store, getCurrentRouteName(_store));
  },

  getRouteSettings() {
    return getRouteSettings(_store, getCurrentRouteName(_store));
  },

  /*
    If it'is a component route, component id is returned
    componet is some writer or extractor like wr-db or ex-db
  */
  getCurrentRouteComponentId() {
    const foundRoute = _store.getIn(['routerState', 'routes'], List()).find(route => {
      const routeConfig = getRoute(_store, route.get('name'));
      if (!routeConfig) {
        return false;
      }
      return routeConfig.get('isComponent', false);
    });

    // generic-detail route has component param, otherwise componentId is route name
    if (foundRoute) {
      return this.getCurrentRouteParam('component', foundRoute.get('name'));
    }
  },

  /*
    Returns if route change is pending
  */
  getIsPending() {
    return _store.get('isPending');
  },

  /*
    @return Error
  */
  getError() {
    return _store.get('error');
  },

  hasRoute(routeName) {
    return !!getRoute(_store, routeName);
  },

  getRequireDataFunctionsForRouterState(routes) {
    return fromJS(routes)
      .map(route => {
        let requireDataFunctions = _store.getIn(['routesByName', route.get('name'), 'requireData']);
        if (!List.isList(requireDataFunctions)) {
          requireDataFunctions = List.of(requireDataFunctions);
        }
        return requireDataFunctions;
      })
      .flatten()
      .filter(func => _.isFunction(func));
  },

  getPollersForRoutes(routes) {
    const route = fromJS(routes)
      .filter(r => !!r.get('name'))
      .last(); // use poller only from last route in hiearchy

    let pollerFunctions = _store.getIn(['routesByName', route.get('name'), 'poll'], List());
    if (!List.isList(pollerFunctions)) {
      pollerFunctions = List.of(pollerFunctions);
    }

    return pollerFunctions;
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.ROUTER_ROUTE_CHANGE_START:
      // set pending only if path was changed - will not show pending indicator when only query is change
      // like search in jobs
      const currentState = RoutesStore.getRouterState();
      if (!(currentState && currentState.get('pathname') === action.routerState.pathname)) {
        _store = _store.set('isPending', true);
      }
      return RoutesStore.emitChange();

    case Constants.ActionTypes.ROUTER_ROUTE_CHANGE_SUCCESS:
      // jobs status (playing icon in header) can be changed so wait for it
      Dispatcher.waitFor([JobsStore.dispatchToken]);

      _store = _store.withMutations(store => {
        const newState = fromJS(action.routerState);
        const notFound =
          newState
            .get('routes')
            .last()
            .get('name') === 'notFound';

        store.set('isPending', false);
        if (notFound) {
          store.set('error', new Error('Page not found', 'Page not found')).set('routerState', newState);
        } else {
          store.remove('error').set('routerState', newState);
        }

        store.set('breadcrumbs', generateBreadcrumbs(store));
        return store;
      });
      return RoutesStore.emitChange();

    case Constants.ActionTypes.ROUTER_ROUTE_CHANGE_ERROR:
      _store = _store.withMutations(store => {
        return store
          .set('isPending', false)
          .set('error', createPresentationalError(action.error))
          .set('breadcrumbs', generateBreadcrumbs(store));
      });
      return RoutesStore.emitChange();

    case Constants.ActionTypes.ROUTER_ROUTES_CONFIGURATION_RECEIVE:
      _store = _store.set('routesByName', nestedRoutesToByNameMap(action.routes));
      return RoutesStore.emitChange();

    case Constants.ActionTypes.ROUTER_ROUTER_CREATED:
      _store = _store.set('router', action.router);
      return RoutesStore.emitChange();

    case ComponentsConstants.INSTALLED_COMPONENTS_CONFIGDATA_LOAD_SUCCESS:
      // update breadcrumb title for generic-detail component route
      const breadcrumbs = _store.get('breadcrumbs').map(function(breadcrumb) {
        const linkParams = breadcrumb.getIn(['link', 'params'], Map());
        const routeName = breadcrumb.get('name');
        const isConfigLink = linkParams.get('config') === action.configId;
        const isComponentLink = linkParams.get('component') === action.componentId;
        const isGenericComponentRoute =
          isConfigLink && isComponentLink && genericDetailRoutesNames.includes(routeName);
        const isComponentRoute = isConfigLink && routeName === action.componentId;
        const isTransformationRoute = isConfigLink && routeName === 'transformationBucket';

        if (isGenericComponentRoute || isComponentRoute || isTransformationRoute) {
          return breadcrumb.set('title', action.data.name);
        }

        return breadcrumb;
      });
      _store = _store.set('breadcrumbs', breadcrumbs);
      return RoutesStore.emitChange();

    case JobsActionTypes.JOB_LOAD_SUCCESS:
      return RoutesStore.emitChange();

    default:
  }
});

export default RoutesStore;
