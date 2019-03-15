/* eslint react/no-multi-comp: 0 */
/*
  Converts routes configuration nested object to React Router components structure
  Example output:
  <Route handler={App} path="/">
    <DefaultRoute handler={Home} />
    <Route name="about" handler={About} />
    <Route name="users" handler={Users}>
      <Route name="recent-users" path="recent" handler={RecentUsers} />
      <Route name="user" path="/user/:userId" handler={User} />
      <NotFoundRoute handler={UserRouteNotFound}/>
    </Route>
    <NotFoundRoute handler={NotFound}/>
    <Redirect from="company" to="about" />
  </Route>
*/

import React from 'react';
import createReactClass from 'create-react-class';
import { Route, RouteHandler, DefaultRoute, NotFoundRoute } from 'react-router';

const Dummy = createReactClass({
  displayName: 'DummyWrapper',
  render() {
    return <RouteHandler />;
  }
});

const createReactRouterRoutes = rootRoute => {
  let _key = 0;

  var composeRoutes = route => {
    const handler = route.handler || Dummy;

    const childRoutes = [];

    if (route.defaultRouteHandler) {
      childRoutes.push(<DefaultRoute handler={route.defaultRouteHandler} name={route.defaultRouteName} key={_key++} />);
    }

    if (route.notFoundRouteHandler) {
      childRoutes.push(<NotFoundRoute handler={route.notFoundRouteHandler} key={_key++} name="notFound" />);
    }

    if (route.childRoutes) {
      route.childRoutes.forEach(childRoute => childRoutes.push(composeRoutes(childRoute)));
    }

    return (
      <Route handler={handler} name={route.name} path={route.path} key={_key++}>
        {childRoutes}
      </Route>
    );
  };

  return composeRoutes(rootRoute);
};

export default createReactRouterRoutes;
