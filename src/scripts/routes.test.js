/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import createReactClass from 'create-react-class';
import routes from './routes';
import createReactRouterRoutes from './utils/createReactRouterRoutes';

jest.mock('react-router', () => {
  const DefaultRoute = () => (<span />);
  const NotFoundRoute = () => (<span />);
  const RouteHandler = () => (<span />);
  const Route = ({ children, ...props }) => (<span {...props}>{children}</span>);

  return {
    DefaultRoute,
    NotFoundRoute,
    RouteHandler,
    Route
  };
});

describe('routes config', function() {
  it('should get router configuration', function() {
    shallowSnapshot(createReactRouterRoutes(routes));
  });
});
