import Promise from 'bluebird';
import ComponentsStore from './stores/ComponentsStore';
import dispatcher from '../../Dispatcher';
import { ActionTypes } from './Constants';

export default {
  setComponentsFilter(query, componentType) {
    dispatcher.handleViewAction({
      type: ActionTypes.COMPONENTS_SET_FILTER,
      query,
      componentType
    });
  },

  receiveAllComponents(componentsRaw) {
    dispatcher.handleViewAction({
      type: ActionTypes.COMPONENTS_LOAD_SUCCESS,
      components: componentsRaw
    });
  },

  loadComponent(componentId) {
    if (ComponentsStore.hasComponent(componentId)) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(`Component ${componentId} not exist.`));
    }
  }
};
