import Promise from 'bluebird';
import dispatcher from '../../Dispatcher';
import SimpleError from '../../utils/errors/SimpleError';
import ComponentsStore from './stores/ComponentsStore';
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
    }

    return Promise.reject(new SimpleError('Component not found', `Component ${componentId} does not exist.`));
  }
};
