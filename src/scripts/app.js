/* eslint no-console: 0 */
console.time('load');

import 'react-app-polyfill/stable';
import './utils/ReactErrorHandler';
import './utils/codemirror/setup';

import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import Promise from 'bluebird';
import _ from 'underscore';
import { List } from 'immutable';

import * as helpers from './helpers';
import appRoutes from './routes';
import createReactRouterRoutes from './utils/createReactRouterRoutes';
import Timer from './utils/Timer';
import { createPresentationalError } from './utils/errors/helpers';

import ApplicationActionCreators from './actions/ApplicationActionCreators';
import RouterActionCreators from './actions/RouterActionCreators';

import RoutesStore from './stores/RoutesStore';
import initializeData from './initializeData';

import ErrorNotification from './react/common/ErrorNotification';

// Promise global config
// Note: long stack traces and warnings are enabled in dev env by default
Promise.config({
  cancellation: true,
  longStackTraces: process.env.NODE_ENV === 'development',
  warnings: process.env.NODE_ENV === 'development'
});

/*
  Bootstrap and start whole application
  appOptions:
    - data - initial data
    - rootNode - mount element
    - locationMode - hash or pushState location
*/
console.timeEnd('load');
const startApp = appOptions => {
  initializeData(appOptions.data);

  ApplicationActionCreators.receiveApplicationData({
    sapiUrl: appOptions.data.sapi.url,
    sapiToken: appOptions.data.sapi.token,
    organizations: appOptions.data.organizations,
    maintainers: appOptions.data.maintainers,
    notifications: appOptions.data.notifications,
    projectTemplates: appOptions.data.projectTemplates,
    kbc: appOptions.data.kbc,
    tokenStats: appOptions.data.tokenStats
  });

  let routes = appRoutes;
  RouterActionCreators.routesConfigurationReceive(routes);

  const router = Router.create({
    routes: createReactRouterRoutes(_.extend({}, routes, { path: appOptions.data.kbc.projectBaseUrl })),
    location: appOptions.locationMode === 'history' ? Router.HistoryLocation : Router.HashLocation
  });

  // error thrown during application live not on route chage
  Promise.onPossiblyUnhandledRejection(e => {
    const error = createPresentationalError(e);

    ApplicationActionCreators.sendNotification({
      message: () => <ErrorNotification error={error} />,
      type: 'error',
      id: error.id
    });

    if (!error.isUserError) {
      throw e;
    }
  });

  // Show loading page before app is ready
  const loading = _.once(Handler => {
    ReactDOM.render(<Handler isLoading={true} />, appOptions.rootNode)
  });

  // registered pollers for previous page
  let registeredPollers = List();

  RouterActionCreators.routerCreated(router);

  let pendingPromise = null;

  // re-render after each route change
  return router.run((Handler, newState) => {
    // avoid state mutation by router
    const state = _.extend({}, newState, {
      routes: _.map(newState.routes, route =>
        // convert to plain object
        _.extend({}, route)
      )
    });

    if (pendingPromise) {
      pendingPromise.cancel();
    }

    RouterActionCreators.routeChangeStart(state);

    // run only once on first render
    loading(Handler);

    // stop pollers required by previous page
    registeredPollers.forEach(action => Timer.stop(action));

    // async data handling inspired by https://github.com/rackt/react-router/blob/master/examples/async-data/app.js
    const promises = RoutesStore.getRequireDataFunctionsForRouterState(state.routes)
      .map(requireData => requireData(state.params, state.query))
      .toArray();

    // wait for data and trigger render
    return (pendingPromise = Promise.all(promises)
      .then(() => {
        RouterActionCreators.routeChangeSuccess(state);
        ReactDOM.render(<Handler />, appOptions.rootNode);

        // Start pollers for new page
        return (registeredPollers = RoutesStore.getPollersForRoutes(state.routes).map(poller => {
          const callback = () => poller.get('action')(state.params, state.query);
          Timer.poll(callback, poller.get('interval'));
          return callback;
        }));
      })
      .catch(error => {
        // render error page
        console.log('route change error', error);
        RouterActionCreators.routeChangeError(error);
        ReactDOM.render(<Handler isError={true} />, appOptions.rootNode);
      })
    );
  });
};

export default {
  start: startApp,
  helpers
};
