
import React from 'react';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import actionsProvisioning from '../../../actionsProvisioning';
import storeProvisioning from '../../../storeProvisioning';
import QueryEditor from '../../components/QueryEditor';

export default function(componentId) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'ExDbNewQuery',
    mixins: [createStoreMixin(storeProvisioning.componentsStore, StorageTablesStore)],

    getStateFromStores() {
      const configId = RoutesStore.getRouterState().getIn(['params', 'config']);
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const newQuery = ExDbStore.getNewQuery();

      return {
        configId: configId,
        newQuery: newQuery,
        tables: StorageTablesStore.getAll(),
        sourceTables: ExDbStore.getSourceTables(),
        defaultOutputTable: ExDbStore.getDefaultOutputTableId(newQuery)
      };
    },

    handleQueryChange(newQuery) {
      return ExDbActionCreators.updateNewQuery(this.state.configId, newQuery);
    },

    render() {
      return (
        <div> AWGRIAERWNGIANGIANR IWN IANGRI AJRGIJ EARIG
          <div className="container-fluid kbc-main-content">
            <QueryEditor
              query = {this.state.newQuery}
              tables = {this.state.tables}
              onChange = {this.handleQueryChange}
              configId = {this.state.configId}
              defaultOutputTable = {this.state.defaultOutputTable}
              componentId = {componentId}
            />
          </div>
        </div>
      );
    }
  });
}
