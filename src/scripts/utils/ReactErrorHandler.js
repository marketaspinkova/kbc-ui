// from https://gist.github.com/Aldredcz/4d63b0a9049b00f54439f8780be7f0d8
// This code handles any JS runtime error during rendering React components. Without this handling, once an error occurs, whole component tree is damaged and can't be used at all. With this handling, nothing will be rendered in production environment (error span in dev env.) + in production the error is logged to Sentry (if you are not using it just delete related code)
// This is basicaly a workaround for proposed feature in React core - described in Issue: https://github.com/facebook/react/issues/2461
// Works for all variants of Component creation - React.createClass, extending React.Component and also stateless functional components.
// To get this work, just put this snippet into your entry js file. Then it will work in whole application.
// Also supporting React Hot Reload!

import React from 'react';
import { Map } from 'immutable';

function logError(Component, error) {
  const errorMsg = `Check render() method of component '${Component.displayName || Component.name || '[unidentified]'}'.`;

  console.error(errorMsg, 'Error details:', error); // eslint-disable-line

  /* global Sentry */
  if (typeof Sentry !== 'undefined' && typeof Sentry.captureException === 'function') {
    Sentry.configureScope((scope) => {
      scope.setExtra('errorStack', error.stack);
    });
    Sentry.captureException(new Error(errorMsg));
  }
}

function monkeypatchRender(prototype) {
  if (prototype && prototype.render && !prototype.render.__handlingErrors) {
    const originalRender = prototype.render;

    prototype.render = function monkeypatchedRender() {
      try {
        return originalRender.call(this);
      } catch (error) {
        logError(prototype.constructor, error);

        return <noscript />;
      }
    };

    prototype.render.__handlingErrors = true; // flag render method so it's not wrapped multiple times
  }
}

function installPatch() {
  const statelessComponentsMap = new Map();
  const originalCreateElement = React.createElement;
  React.createElement = (Component, ...rest) => {
    let NewComponent = Component;
    if (typeof NewComponent === 'function') {
      if (NewComponent.prototype && typeof NewComponent.prototype.render === 'function') {
        monkeypatchRender(NewComponent.prototype);
      }
      // stateless functional component
      if (!NewComponent.prototype || !NewComponent.prototype.render) {
        const originalStatelessComponent = NewComponent;
        if (statelessComponentsMap.has(originalStatelessComponent)) {
          // load from cache
          NewComponent = statelessComponentsMap.get(originalStatelessComponent);
        } else {
          NewComponent = (...args) => {
            try {
              return originalStatelessComponent(...args);
            } catch (error) {
              logError(originalStatelessComponent, error);

              return <noscript />;
            }
          };

          Object.assign(NewComponent, originalStatelessComponent); // copy all properties like propTypes, defaultProps etc.
          statelessComponentsMap.set(originalStatelessComponent, NewComponent); // save to cache, so we don't generate new monkeypatched functions every time.
        }
      }
    }

    return originalCreateElement.call(React, NewComponent, ...rest);
  };
}

if (!process.env.__DEV__) {
  installPatch();
}
