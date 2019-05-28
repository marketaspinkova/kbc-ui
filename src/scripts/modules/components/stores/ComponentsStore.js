import Dispatcher from '../../../Dispatcher';
import * as Constants from '../Constants';
import { Map, List, fromJS } from 'immutable';
import _ from 'underscore';
import underscoreString from 'underscore.string';
import camelize from 'underscore.string/camelize';
import fuzzy from 'fuzzy';
import fuzzaldrin from 'fuzzaldrin';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';
import ApplicationStore from '../../../stores/ApplicationStore';

let _store = initStore('ComponentsStore', Map({
  components: Map(),
  filter: Map()
}));

const ComponentsStore = StoreUtils.createStore({
  getComponentsTypes() {
    return _store
      .get('componentsById')
      .groupBy(val => val.get('type'))
      .keySeq()
      .toJS();
  },

  getAll() {
    return _store.get('componentsById');
  },

  getAllForType(type) {
    return _store.get('componentsById').filter(component => component.get('type') === type);
  },

  getComponent(id) {
    return _store.getIn(['componentsById', id]);
  },

  hasComponent(id) {
    return _store.hasIn(['componentsById', id]);
  },

  getFilteredForType(type) {
    const filter = this.getComponentFilter(type).toLowerCase();
    return this.getAllForType(type).filter(component => {
      const description = component.get('description').toLowerCase();
      return (
        fuzzy.match(filter, component.get('name')) ||
        fuzzaldrin.score(description, filter) > 0.09 ||
        description.indexOf(filter) >= 0
      );
    });
  },

  getComponentFilter(type) {
    const filter = _store.getIn(['filter', type]) || '';
    return filter.trim();
  },

  hasComponentLegacyUI(id) {
    return _store.getIn(['componentsById', id], Map()).get('hasUI');
  },

  getRecipeAppUrl(recipeId, configurationId) {
    const projectId = ApplicationStore.getCurrentProjectId();
    let legacyRecipeDetail = ApplicationStore.getUrlTemplates().get('home');
    const recipeAppName = 'kbc.docToolRecipesApp';
    legacyRecipeDetail = `${legacyRecipeDetail}/${projectId}/application/?app=${recipeAppName}`;
    legacyRecipeDetail = `${legacyRecipeDetail}#/${recipeId}/${configurationId}`;
    return legacyRecipeDetail;
  },

  getComponentDetailLegacyUrl(id, configurationId) {
    let templateName;
    const component = this.getComponent(id);

    if (component.get('type') === 'extractor') {
      templateName = 'legacyExtractorDetail';
    } else {
      templateName = 'legacyWriterDetail';
    }

    const recipeId = id;
    const isRecipe = underscoreString.startsWith(recipeId, 'rcp-');
    if (isRecipe) {
      return this.getRecipeAppUrl(recipeId, configurationId);
    }

    const template = ApplicationStore.getUrlTemplates().get(templateName);
    return _.template(template)({
      projectId: ApplicationStore.getCurrentProjectId(),
      appId: `kbc.${camelize(id)}`,
      configId: configurationId
    });
  },

  unknownComponent(name) {
    return Map({
      id: name,
      name,
      type: 'unknown',
      flags: List(),
      data: Map()
    });
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.COMPONENTS_SET_FILTER:
      _store = _store.setIn(['filter', action.componentType], action.query.trim());
      return ComponentsStore.emitChange();

    case Constants.ActionTypes.COMPONENTS_LOAD_SUCCESS:
      _store = _store.set(
        'componentsById',
        fromJS(action.components)
          .toMap()
          .mapKeys((key, component) => component.get('id'))
      );
      return ComponentsStore.emitChange();

    default:
      break;
  }
});

export default ComponentsStore;
