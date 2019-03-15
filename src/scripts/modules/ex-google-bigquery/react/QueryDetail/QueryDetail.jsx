import React from 'react';

import createReactClass from 'create-react-class';

// stores
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import RoutesStore from '../../../../stores/RoutesStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';

// actions
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import QueryEditor from '../components/QueryEditor';
import QueryNav from './QueryNav';
import QueryDetailStatic from './QueryDetailStatic';
import EditButtons from '../../../../react/common/EditButtons';

// CONSTS
const COMPONENT_ID = 'keboola.ex-google-bigquery';

export default createReactClass({

  mixins: [createStoreMixin(...storeMixins)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const queryId = RoutesStore.getCurrentRouteParam('query');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    const query = store.getConfigQuery(queryId);
    const editingQuery = store.getEditingQuery(queryId);

    return {
      actions: actions,
      store: store,
      configId: configId,
      queryId: queryId,
      query: query,
      editingQuery: editingQuery,
      isEditing: !!editingQuery,
      isSaving: store.isSavingQuery(queryId),
      isValid: store.isQueryValid(editingQuery),
      tables: StorageTablesStore.getAll(),
      queriesFilter: store.filter,
      queriesFiltered: store.queriesFiltered,
      defaultOutputTable: store.getDefaultOutputTableId(editingQuery)
    };
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="col-md-3 kbc-main-nav">
            <div className="kbc-container">
              <QueryNav
                queries={this.state.queriesFiltered}
                configurationId={this.state.configId}
                filter={this.state.queriesFilter}
                setQueriesFilter={this.state.actions.setQueriesFilter}
              />
            </div>
          </div>
          <div className="col-md-9 kbc-main-content-with-nav">
            <div className="row kbc-header">
              <div className="kbc-buttons">
                <EditButtons
                  isEditing={this.state.isEditing}
                  isSaving={this.state.store.isSavingQuery(this.state.queryId)}
                  isDisabled={!this.state.store.isQueryValid(this.state.editingQuery)}
                  onCancel={ () => this.state.actions.cancelEditingQuery(this.state.queryId)}
                  onSave={ () => this.state.actions.saveEditingQuery(this.state.queryId)}
                  onEditStart={ () => this.state.actions.startEditingQuery(this.state.queryId)}/>
              </div>
            </div>
            { this.state.isEditing ?
              <QueryEditor
                query={this.state.editingQuery}
                tables={this.state.tables}
                onChange={this.state.actions.onUpdateEditingQuery}
                showOutputTable={true}
                configId={this.state.configId}
                componentId={COMPONENT_ID}
                defaultOutputTable={this.state.defaultOutputTable}
              />
              :
              <QueryDetailStatic
                query={this.state.query}
                componentId={COMPONENT_ID}
              />
            }
          </div>
        </div>
      </div>

    );
  }
});
