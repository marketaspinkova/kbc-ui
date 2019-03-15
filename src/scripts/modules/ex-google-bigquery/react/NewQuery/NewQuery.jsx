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

// CONSTS
const COMPONENT_ID = 'keboola.ex-google-bigquery';

export default createReactClass({

  mixins: [createStoreMixin(...storeMixins)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    const newQuery = store.getNewQuery();

    return {
      newQuery: newQuery,
      defaultOutputTable: store.getDefaultOutputTableId(newQuery),
      store: store,
      actions: actions,
      configId: configId,
      localState: store.getLocalState(),
      tables: StorageTablesStore.getAll()
    };
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <QueryEditor
            onChange={this.state.actions.onUpdateNewQuery}
            tables={this.state.tables}
            showOutputTable={true}
            configId={this.state.configId}
            defaultOutputTable={this.state.defaultOutputTable}
            componentId={COMPONENT_ID}
            query={this.state.newQuery}
            {...this.state.actions.prepareLocalState('NewQuery')}/>
        </div>
      </div>
    );
  }
});
