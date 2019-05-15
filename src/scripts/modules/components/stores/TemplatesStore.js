import StoreUtils from '../../../utils/StoreUtils';
import { Map } from 'immutable';
import dispatcher from '../../../Dispatcher';
import * as Constants from '../TemplatesConstants';
import fromJSOrdered from '../../../utils/fromJSOrdered';
import templateFinder from '../utils/templateFinder';

let _store = Map({
  loadingTemplates: Map(),
  templates: Map()
});

const TemplatesStore = StoreUtils.createStore({
  hasTemplates(componentId) {
    return _store.hasIn(['templates', componentId]);
  },

  // new
  getConfigTemplates(componentId) {
    return _store.getIn(['templates', componentId, 'templates', 'config'], Map());
  },

  getApiTemplate(componentId) {
    return _store.getIn(['templates', componentId, 'templates', 'api'], Map());
  },

  isConfigTemplate(componentId, configuration) {
    const templates = _store.getIn(['templates', componentId, 'templates', 'config'], Map());
    return templateFinder(templates, configuration).count() === 1;
  },

  getMatchingTemplate(componentId, configuration) {
    const templates = _store.getIn(['templates', componentId, 'templates', 'config'], Map());
    if (templates.isEmpty()) {
      return Map();
    }
    const match = templateFinder(templates, configuration);
    if (match.count() === 1) {
      return match.first();
    }
    return Map();
  }
});

dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.TEMPLATES_LOAD_SUCCESS:
      _store = _store.setIn(['templates', action.componentId], fromJSOrdered(action.templates));
      return TemplatesStore.emitChange();

    case Constants.ActionTypes.TEMPLATES_LOAD_START:
      _store = _store.setIn(['loadingTemplates', action.componentId], true);
      return TemplatesStore.emitChange();

    case Constants.ActionTypes.TEMPLATES_LOAD_ERROR:
      _store = _store.setIn(['loadingTemplates', action.componentId], false);
      return TemplatesStore.emitChange();

    default:
      break;
  }
});

export default TemplatesStore;
