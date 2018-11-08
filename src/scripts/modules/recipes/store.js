import Dispatcher from '../../Dispatcher';
import { ActionTypes } from './constants';

import { Map, List, fromJS } from 'immutable';
import StoreUtils from '../../utils/StoreUtils';

let _store = Map({
  recipes: List(),
  templateVariables: Map()
});

const RecipesStore = StoreUtils.createStore({
  getAll: () => _store.get('recipes'),
  getTemplateVariables: () => _store.get('templateVariables')
});


Dispatcher.register((payload) => {
  const action = payload.action;
  switch (action.type) {
    case ActionTypes.RECIPES_LOAD_SUCCESS:
      _store = _store.set('recipes', fromJS(action.recipes));
      RecipesStore.emitChange();
      break;
    case ActionTypes.RECIPES_SET_TEMPLATE_VARIABLE:
      _store = _store.setIn(
        [
          'templateVariables',
          `RECIPE-${action.recipeId}-CONFIG-${action.recipeConfigId}`
        ],
        action.configurationId
      );
      RecipesStore.emitChange();
      break;
    default:
      break;
  }
});

export default RecipesStore;
