// from https://gist.github.com/Aldredcz/4d63b0a9049b00f54439f8780be7f0d8
// This code handles any JS runtime error during rendering React components. Without this handling, once an error occurs, whole component tree is damaged and can't be used at all. With this handling, nothing will be rendered in production environment (error span in dev env.) + in production the error is logged to Sentry (if you are not using it just delete related code)
// This is basicaly a workaround for proposed feature in React core - described in Issue: https://github.com/facebook/react/issues/2461
// Works for all variants of Component creation - React.createClass, extending React.Component and also stateless functional components.
// To get this work, just put this snippet into your entry js file. Then it will work in whole application.
// Also supporting React Hot Reload!

import React from 'react';

let errorPlaceholder = <noscript/>;

if (process.env.__DEV__) {
  errorPlaceholder = (
    <span
      style={{
        background: 'red',
        color: 'white'
      }}
    >
      Render error!
    </span>
  );
}

function logError(Component, error) {
  const errorMsg = `Error. Check render() method of component '${Component.displayName || Component.name || '[unidentified]'}'.`;

  console.error(errorMsg, 'Error details:', error); // eslint-disable-line

  /* global Raven */
  if (!process.env.__DEV__ && typeof Raven !== 'undefined' && typeof Raven.captureException === 'function') {
    Raven.captureException(new Error(errorMsg), {
      extra: {
        errorStack: error.stack
      }
    });
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

        return errorPlaceholder;
      }
    };

    prototype.render.__handlingErrors = true; // flag render method so it's not wrapped multiple times
  }
}

const originalCreateElement = React.createElement;
React.createElement = (Component, ...rest) => {
  let newComponent = Component;
  if (typeof Component === 'function') {
    if (typeof Component.prototype.render === 'function') {
      monkeypatchRender(Component.prototype);
    }
    // stateless functional component
    if (!Component.prototype.render) {
      const originalStatelessComponent = Component;
      newComponent = (...args) => {
        try {
          return originalStatelessComponent(...args);
        } catch (error) {
          logError(originalStatelessComponent, error);

          return errorPlaceholder;
        }
      };
    }
  }

  return originalCreateElement.call(React, newComponent, ...rest);
};


// allowing hot reload
const originalForceUpdate = React.Component.prototype.forceUpdate;
React.Component.prototype.forceUpdate = function monkeypatchedForceUpdate() {
  monkeypatchRender(this);
  originalForceUpdate.call(this);
};
