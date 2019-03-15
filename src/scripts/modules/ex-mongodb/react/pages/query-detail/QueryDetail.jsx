import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import QueryEditor from '../../components/QueryEditor';
import QueryNav from './QueryNav';
import SaveButtons from '../../../../../react/common/SaveButtons';
import * as constants from './../../../constants';

export default (componentId, actionsProvisioning, storeProvisioning) => {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);

  return createReactClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore, StorageTablesStore)],
    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },
    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteIntParam('query');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const isEditing = ExDbStore.isEditingQuery(queryId);
      const query = ExDbStore.getConfigQuery(queryId);
      const editingQuery = ExDbStore.isEditingQuery(queryId)
        ? ExDbStore.getEditingQuery(queryId)
        : query;
      const isChanged = ExDbStore.isChangedQuery(queryId);

      return {
        editingQueries: ExDbStore.getEditingQueries(),
        newQueries: ExDbStore.getNewQueries(),
        newQueriesIdsList: ExDbStore.getNewQueriesIdsList(),
        configId: configId,
        query: query,
        editingQuery: editingQuery,
        isEditing: isEditing,
        isChanged: isChanged,
        isSaving: ExDbStore.isSavingQuery(queryId),
        isValid: ExDbStore.isEditingQueryValid(queryId),
        exports: StorageTablesStore.getAll(),
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        outTableExist: ExDbStore.outTableExist(editingQuery),
        component: storeProvisioning.componentsStore.getComponent(constants.COMPONENT_ID)
      };
    },
    _handleQueryChange(newQuery) {
      return ExDbActionCreators.updateEditingQuery(this.state.configId, newQuery);
    },
    _handleReset() {
      return ExDbActionCreators.resetQueryEdit(this.state.configId, this.state.query.get('id'));
    },
    _handleSave() {
      return ExDbActionCreators.saveQueryEdit(this.state.configId, this.state.query.get('id'));
    },
    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="col-md-3 kbc-main-nav">
              <div className="kbc-container">
                <QueryNav
                  actionCreators={ExDbActionCreators}
                  componentId={componentId}
                  configurationId={this.state.configId}
                  editingQueries={this.state.editingQueries || List()}
                  filter={this.state.queriesFilter}
                  navQuery={this.state.editingQuery || Map()}
                  newQueries={this.state.newQueries || List()}
                  newQueriesIdsList={this.state.newQueriesIdsList}
                  queries={this.state.queriesFiltered}
                />
              </div>
            </div>
            <div className="col-md-9 kbc-main-content-with-nav">
              <div className="kbc-inner-padding text-right">
                <div className="kbc-buttons">
                  <SaveButtons
                    isSaving={this.state.isSaving}
                    isChanged={this.state.isChanged}
                    onReset={this._handleReset}
                    onSave={this._handleSave}
                    disabled={this.state.isSaving || !this.state.isValid}
                  />
                </div>
              </div>
              <div className="kbc-inner-padding">
                <QueryEditor
                  query={this.state.editingQuery}
                  exports={this.state.exports}
                  onChange={this._handleQueryChange}
                  configId={this.state.configId}
                  componentId={componentId}
                  outTableExist={this.state.outTableExist}
                  component={this.state.component}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  });
};
