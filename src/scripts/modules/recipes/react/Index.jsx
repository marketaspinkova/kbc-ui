import React from 'react';
import { SearchBar } from '@keboola/indigo-ui';

import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RecipesStore from '../store';
import ComponentsStore from '../../components/stores/ComponentsStore';
import ComponentIcon from '../../../react/common/ComponentIcon';
import ComponentName from '../../../react/common/ComponentName';
import CreateConfigurationsFromRecipeModal from './CreateConfigurationsFromRecipeModal';
import { createConfigurationsFromRecipe } from '../actions';

export default React.createClass({
  mixins: [createStoreMixin(RecipesStore)],

  getStateFromStores() {
    return {
      recipes: RecipesStore.getAll()
    };
  },

  getInitialState() {
    return {
      query: '',
      showCreateConfigurationsModal: false,
      recipeToProcess: null
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="row-searchbar">
            <SearchBar
              query={this.state.query}
              onChange={(query) => {
                this.setState({
                  query: query
                });
              }}
              placeholder="Search in recipes"
            />
          </div>
          {this.state.recipeToProcess && this.renderCreateConfigurationsModal()}
          {this.state.recipes.map(this.renderRecipe)}
        </div>
      </div>
    );
  },

  renderCreateConfigurationsModal() {
    return (
      <CreateConfigurationsFromRecipeModal
        show={this.state.showCreateConfigurationsModal}
        recipe={this.state.recipeToProcess}
        onHide={() => {
          this.setState({
            showCreateConfigurationsModal: false,
            recipeToProcess: null
          });
        }}
        onSave={() => {
          createConfigurationsFromRecipe(this.state.recipeToProcess)
            .then(() => {
              this.setState({
                showCreateConfigurationsModal: false,
                recipeToProcess: null
              });
            });
        }}
      />
    );
  },

  renderRecipe(recipe) {
    let items = [];
    recipe.get('configurations').forEach((config, index) => {
      const component = ComponentsStore.getComponent(config.get('component'));
      items.push((
        <div
          key={'recipes-index-recipe-' + recipe.get('id') + '-config-' + config.get('id')}
          className="text-center"
          style={{padding: '1em'}}
        >
          <div>
            <ComponentIcon component={component} />
            <br />
            <h4>
              <ComponentName component={component} />
            </h4>
          </div>
        </div>
      ));
      if (index !== recipe.get('configurations').count() - 1) {
        items.push((
          <i className="fa fa-arrow-right" />
        ));
      }
    });

    return (
      <div key={'recipes-index-recipe-' + recipe.get('id')} className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <h2>{recipe.get('name')}</h2>
        <p>{recipe.get('description')}</p>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {items}
          </div>
          <button
            onClick={() => {
              this.setState({
                showCreateConfigurationsModal: true,
                recipeToProcess: recipe
              });
            }}
            className="btn btn-success"
          >
            Create configurations from this recipe
          </button>
        </div>
      </div>
    );
  }
});
