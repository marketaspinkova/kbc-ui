import Index from './react/Index';
import { loadRecipes } from './actions';

export default {
  name: 'recipes',
  title: 'Recipes',
  defaultRouteHandler: Index,
  requireData: [
    () => loadRecipes()
  ]
};
