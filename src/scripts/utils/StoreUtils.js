import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

const StoreUtils = {
  createStore(spec) {
    const store = {
      ...EventEmitter.prototype,
      ...spec,
      emitChange() {
        return this.emit(CHANGE_EVENT);
      },

      addChangeListener(callback) {
        return this.on(CHANGE_EVENT, callback);
      },

      removeChangeListener(callback) {
        return this.removeListener(CHANGE_EVENT, callback);
      }
    };
    store.setMaxListeners(30);
    return store;
  }
};

const initStore = (name, store) => {
  return store;
};

export {
  initStore
}

export default StoreUtils;
