import dispatcher from '../../Dispatcher';
import Promise from 'bluebird';
import templatesStore from './stores/TemplatesStore';
import templatesApi from './TemplatesApi';
import { ActionTypes } from './TemplatesConstants';

export default {
  loadSchema(componentId) {
    if (templatesStore.hasTemplates(componentId)) {
      return Promise.resolve();
    }
    return this.loadSchemaForce(componentId);
  },

  loadSchemaForce(componentId) {
    const loadTemplateComponentId = componentId;
    dispatcher.handleViewAction({
      componentId,
      type: ActionTypes.TEMPLATES_LOAD_START
    });
    return templatesApi
      .getTemplate(loadTemplateComponentId)
      .then(result => {
        dispatcher.handleViewAction({
          componentId,
          type: ActionTypes.TEMPLATES_LOAD_SUCCESS,
          templates: result
        });
        return result;
      })
      .catch(() =>
        dispatcher.handleViewAction({
          componentId,
          type: ActionTypes.TEMPLATES_LOAD_ERROR
        })
      );
  }
};
