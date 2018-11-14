import React from 'react';

import createReactClass from 'create-react-class';

import {Navigation} from 'react-router';

// stores
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import RoutesStore from '../../../../stores/RoutesStore';

// actions
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import QueryDeleteButton from './QueryDeleteButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';
import ActivateDeactivateSwitch from '../../../../react/common/ActivateDeactivateSwitch';

// CONSTS
const COMPONENT_ID = 'keboola.ex-google-bigquery';

export default createReactClass({

  mixins: [createStoreMixin(...storeMixins), Navigation],

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const queryId = RoutesStore.getCurrentRouteParam('query');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    return {
      configId: configId,
      queryId: queryId,
      query: store.getConfigQuery(queryId),
      store: store,
      actions: actions
    };
  },

  render() {
    const query = this.state.query;
    const queryId = this.state.queryId;
    return (
      <div>
        <QueryDeleteButton
          query={query}
          onDeleteFn={() => this.handleDelete(queryId)}
          isPending={this.state.store.isPending(['deleteQuery', queryId])}
          tooltipPlacement="bottom"
        />
        <RunExtractionButton
          title="Run Extraction"
          component={COMPONENT_ID}
          runParams={ () => {
            return {
              config: this.state.configId,
              configData: this.state.store.getRunSingleQueryData(queryId)
            };
          }}
          tooltipPlacement="bottom"
        >
          You are about to run an extraction.
        </RunExtractionButton>
        <ActivateDeactivateSwitch
          activateTooltip="Enable Query"
          deactivateTooltip="Disable Query"
          isActive={query.get('enabled')}
          isPending={this.state.store.isPending(['toggleQuery', queryId])}
          onChange={() => this.handleToggle(queryId)}
          tooltipPlacement="bottom"
        />
      </div>
    );
  },

  handleDelete(qid) {
    this.transitionTo(COMPONENT_ID, {config: this.state.configId});
    this.state.actions.deleteQuery(qid);
  },

  handleToggle(qid) {
    this.state.actions.changeQueryEnabledState(qid);
  }
});
