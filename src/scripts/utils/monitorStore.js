/* eslint-disable */
import Dispatcher from '../Dispatcher';

let monitoredStore, devTools, action, previousStore;

try {
  devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
} catch (err) {}

Dispatcher.register(payload => {
  action = payload.action;
});

const persistentMethods = [
  'set',
  'delete',
  'clear',
  'update',
  'merge',
  'mergeWith',
  'mergeDeep',
  'mergeDeepWith',
  'setIn',
  'deleteIn',
  'updateIn',
  'mergeIn',
  'mergeDeepIn',
  'withMutations'
];

const monitor = store => {
  if (process.env.NODE_ENV !== 'development') {
    console.error('Monitor is available only for development.');
    return store;
  }

  if (!devTools) {
    console.error('Cannot find Redux Devtools browser extension. Is it installed?');
    return store;
  }

  monitoredStore = new Proxy(store, {
    get: (target, method) => {
      if (persistentMethods.includes(method)) {
        return function(...args) {
          const newStore = target[method].apply(this, args);
          if (!monitoredStore) {
            devTools.init(newStore);
          } else if (!newStore.equals(previousStore)) {
            previousStore = newStore;
            devTools.send(action.type, newStore);
          }
          return monitor(newStore);
        };
      }
      return target[method];
    }
  });
  return monitoredStore;
};

export default monitor;
