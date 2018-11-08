import Promise from 'bluebird';
import { fromJS } from 'immutable';
import dispatcher from '../../Dispatcher';
import { ActionTypes, Recipes } from './constants';
import installedComponentsApi from '../components/InstalledComponentsApi';
import RecipesStore from './store';
import { replaceTemplateVariables } from './helpers';

const createComponentConfiguration = (componentId, configuration) => {
  const data = {
    name: configuration.get('name'),
    description: configuration.get('description'),
    configuration: JSON.stringify(configuration.get('configuration').toJS())
  };
  return installedComponentsApi.createConfiguration(componentId, data);
};

const createComponentConfigurationRow = (componentId, configId, configuration) => {
  const data = {
    name: configuration.get('name'),
    description: configuration.get('description'),
    configuration: JSON.stringify(configuration.get('configuration').toJS())
  };
  return installedComponentsApi.createConfigurationRow(componentId, configId, data);
};

const recipesMockApi = {
  getRecipes: () => {
    return Promise.resolve(Recipes);
  }
};

const loadRecipes = () => {
  return recipesMockApi.getRecipes().then((recipes) => {
    return dispatcher.handleViewAction({
      type: ActionTypes.RECIPES_LOAD_SUCCESS,
      recipes: recipes
    });
  });
};

const createConfigurationsFromRecipe = (recipe) => {
  dispatcher.handleViewAction({
    type: ActionTypes.RECIPES_CREATE_CONFIGURATIONS_START
  });

  return createConfigurations(recipe)
    .then(() => {
      dispatcher.handleViewAction({
        type: ActionTypes.RECIPES_CREATE_CONFIGURATIONS_SUCCESS
      });
    });
};

const createConfigurations = (recipe) => {
  const recipeId = recipe.get('id');
  return Promise.each(
    recipe.get('configurations').toArray(), (config) => {
      const componentId = config.get('component');
      const recipeConfigId = config.get('id');

      const configuration = fromJS(
        replaceTemplateVariables(
          config.get('config')
            .set('name', 'recipe')
            .set('description', 'recipe desc').toJS(),
          RecipesStore.getTemplateVariables().toJS()
        )
      );

      dispatcher.handleViewAction({
        type: ActionTypes.RECIPES_CREATE_CONFIGURATION_START
      });

      const componentCreationResult = createComponentConfiguration(componentId, configuration);

      if (configuration.has('rows')) {
        return componentCreationResult.then((response) => {
          const configurationId = response.id;
          dispatcher.handleViewAction({
            type: ActionTypes.RECIPES_SET_TEMPLATE_VARIABLE,
            recipeConfigId,
            configurationId,
            recipeId
          });

          return Promise.all([
            configuration.get('rows').map((row) => {
              return createComponentConfigurationRow(componentId, configurationId, row);
            })
          ]);
        });
      }

      return componentCreationResult
        .then((response) => {
          const configurationId = response.id;
          dispatcher.handleViewAction({
            type: ActionTypes.RECIPES_SET_TEMPLATE_VARIABLE,
            recipeConfigId,
            configurationId,
            recipeId
          });
        });
    }
  );
};

export {
  loadRecipes,
  createConfigurationsFromRecipe
};
