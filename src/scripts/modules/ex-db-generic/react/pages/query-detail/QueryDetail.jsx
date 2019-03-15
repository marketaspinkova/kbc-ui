import React from 'react';
import createReactClass from 'create-react-class';
import {Map, List} from 'immutable';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';

import QueryEditor from '../../components/QueryEditor';
import {CONNECTION_ERROR_PATH, INCREMENTAL_CANDIDATES_PATH, LOADING_SOURCE_TABLES_PATH} from '../../../storeProvisioning';
import {SOURCE_TABLES_PATH} from '../../../storeProvisioning';
import {SOURCE_TABLES_ERROR_PATH} from '../../../storeProvisioning';

import QueryNav from './QueryNav';
import SaveButtons from '../../../../../react/common/SaveButtons';
import {loadSourceTables, reloadSourceTables} from '../../../actionsProvisioning';

export default function(componentId, actionsProvisioning, storeProvisioning) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return createReactClass({
    displayName: 'ExDbQueryDetail',
    mixins: [createStoreMixin(storeProvisioning.componentsStore, StorageTablesStore)],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    componentDidMount() {
      // fetch sourceTable info if not done already
      if (!this.state.sourceTables) {
        return loadSourceTables(componentId, this.state.configId);
      }
    },

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteIntParam('query');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const query = ExDbStore.getConfigQuery(queryId);
      const editingQuery = (ExDbStore.isEditingQuery(queryId)) ? ExDbStore.getEditingQuery(queryId) : query;
      const credentials = ExDbStore.getCredentials(componentId, configId);
      return {
        configId: configId,
        queryId: queryId,
        editingQuery: editingQuery,
        editingQueries: ExDbStore.getEditingQueries(),
        newQueries: ExDbStore.getNewQueries(),
        newQueriesIdsList: ExDbStore.getNewQueriesIdsList(),
        isSaving: ExDbStore.isSavingQuery(queryId),
        isValid: ExDbStore.isEditingQueryValid(queryId) && !ExDbStore.queryNameExists(editingQuery),
        tables: StorageTablesStore.getAll(),
        sourceTables: ExDbStore.getSourceTables(),
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        componentSupportsSimpleSetup: actionsProvisioning.componentSupportsSimpleSetup(componentId),
        queryNameExists: ExDbStore.queryNameExists(editingQuery),
        localState: ExDbStore.getLocalState(),
        credentialsHasDatabase: !!credentials.get('database'),
        credentialsHasSchema: !!credentials.get('schema'),
        isTestingConnection: ExDbStore.isTestingConnection(),
        validConnection: ExDbStore.isConnectionValid(),
        isConfigRow: ExDbStore.isRowConfiguration(),
        incrementalCandidates: ExDbStore.getIncrementalCandidates()
      };
    },

    handleQueryChange(newQuery) {
      return ExDbActionCreators.changeQueryEdit(this.state.configId, newQuery);
    },

    handleReset() {
      return ExDbActionCreators.resetQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    handleSave() {
      return ExDbActionCreators.saveQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    handleRefreshSourceTables() {
      return reloadSourceTables(componentId, this.state.configId);
    },

    getDefaultOutputTableId(name) {
      return ExDbActionCreators.getDefaultOutputTableId(this.state.configId, name);
    },

    getQueryElement() {
      return (
        <QueryEditor
          query={this.state.editingQuery || Map()}
          tables={this.state.tables}
          onChange={this.handleQueryChange}
          disabled={this.state.isSaving}
          showSimple={this.state.componentSupportsSimpleSetup}
          configId={this.state.configId}
          componentId={componentId}
          getDefaultOutputTable={this.getDefaultOutputTableId}
          isLoadingSourceTables={this.state.localState.getIn(LOADING_SOURCE_TABLES_PATH, false)}
          isTestingConnection={this.state.isTestingConnection}
          validConnection={this.state.validConnection}
          connectionError={this.state.localState.getIn(CONNECTION_ERROR_PATH)}
          sourceTables={this.state.localState.getIn(SOURCE_TABLES_PATH) || List()}
          sourceTablesError={this.state.localState.getIn(SOURCE_TABLES_ERROR_PATH)}
          destinationEditing={this.state.localState.getIn(['isDestinationEditing', this.state.queryId], false)}
          onDestinationEdit={ExDbActionCreators.destinationEdit}
          getPKColumns={ExDbActionCreators.getPKColumnsFromSourceTable}
          queryNameExists={this.state.queryNameExists}
          credentialsHasDatabase={this.state.credentialsHasDatabase}
          credentialsHasSchema={this.state.credentialsHasSchema}
          refreshMethod={this.handleRefreshSourceTables}
          isConfigRow={this.state.isConfigRow}
          incrementalCandidates={this.state.localState.getIn(INCREMENTAL_CANDIDATES_PATH) || List()}
        />
      );
    },

    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="col-md-3 kbc-main-nav">
              <div className="kbc-container">
                <QueryNav
                  queries={this.state.queriesFiltered}
                  navQuery={this.state.editingQuery || Map()}
                  editingQueries={this.state.editingQueries || List()}
                  newQueries={this.state.newQueries || List()}
                  newQueriesIdsList={this.state.newQueriesIdsList}
                  configurationId={this.state.configId}
                  filter={this.state.queriesFilter}
                  componentId={componentId}
                  actionsProvisioning={actionsProvisioning}
                />
              </div>
            </div>
            <div className="col-md-9 kbc-main-content-with-nav">
              <div className="row kbc-header">
                <div className="kbc-buttons">
                  <SaveButtons
                    isSaving={this.state.localState.getIn(['isSaving', this.state.queryId], false)}
                    isChanged={this.state.localState.getIn(['isChanged', this.state.queryId], false)}
                    onReset={this.handleReset}
                    onSave={this.handleSave}
                    disabled={this.state.localState.getIn(['isSaving', this.state.queryId], false) || !this.state.isValid}
                  />
                </div>
              </div>
              {this.getQueryElement()}
            </div>
          </div>
        </div>
      );
    }
  });
}

