import dispatcher from '../../Dispatcher';
import { ActionTypes } from './Constants';
import NewConfigurationsStore from './stores/NewConfigurationsStore';
import createComponentConfiguration from './utils/createComponentConfiguration';
import transitionToComponentConfiguration from './utils/componentConfigurationTransition';
import ComponentsStore from './stores/ComponentsStore';

export default {
  updateConfiguration(componentId, configuration) {
    dispatcher.handleViewAction({
      type: ActionTypes.COMPONENTS_NEW_CONFIGURATION_UPDATE,
      componentId,
      configuration
    });
  },

  resetConfiguration(componentId) {
    dispatcher.handleViewAction({
      type: ActionTypes.COMPONENTS_NEW_CONFIGURATION_CANCEL,
      componentId
    });
  },

  saveConfiguration(componentId) {
    const configuration = NewConfigurationsStore.getConfiguration(componentId);

    dispatcher.handleViewAction({
      type: ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_START,
      componentId
    });

    return createComponentConfiguration(componentId, configuration)
      .then(response => {
        const component = ComponentsStore.getComponent(componentId);
        dispatcher.handleViewAction({
          type: ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_SUCCESS,
          componentId,
          component,
          configuration: response
        });

        return transitionToComponentConfiguration(componentId, response.id);
      })
      .catch(e => {
        dispatcher.handleViewAction({
          type: ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_ERROR,
          componentId,
          error: e
        });
        throw e;
      });
  }
};
