import React from 'react';
import createReactClass from 'create-react-class';
import {Map} from 'immutable';

import RoutesStore from '../../../../stores/RoutesStore';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import QueryDeleteButton from './QueryDeleteButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';
import ActivateDeactivateSwitch from '../../../../react/common/ActivateDeactivateSwitch';

export default function(
  componentId,
  actionsProvisioning,
  storeProvisioning,
  entityName = 'Query'
) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return createReactClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config'),
        ExDbStore = storeProvisioning.createStore(componentId, configId),
        queryId = RoutesStore.getCurrentRouteIntParam('query'),
        query = ExDbStore.getConfigQuery(queryId);

      return {
        configId: configId,
        queryId: queryId,
        query: query,
        pendingActions: ExDbStore.getQueriesPendingActions().get(query.get('id'), Map()),
        isEditingQuery: ExDbStore.isEditingQuery(queryId)
      };
    },

    componentWillReceiveProps() {
      this.setState(this.getStateFromStores());
    },

    render() {
      return (
        <div>
          <QueryDeleteButton
            componentId={componentId}
            query={this.state.query}
            configurationId={this.state.configId}
            isPending={!!this.state.pendingActions.get('deleteQuery')}
            tooltipPlacement="bottom"
            actionsProvisioning={actionsProvisioning}
            entityName={entityName}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={componentId}
            runParams={this.runParams}
            config={this.state.configId}
            tooltipPlacement="bottom"
            disabled={this.state.isEditingQuery}
          >
            You are about to run an extraction.
          </RunExtractionButton>
          <ActivateDeactivateSwitch
            activateTooltip={'Enable ' + entityName}
            deactivateTooltip={'Disable ' + entityName}
            isActive={this.state.query.get('enabled')}
            isPending={this.state.pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
            tooltipPlacement="bottom"
            buttonDisabled={this.state.isEditingQuery}
          />
        </div>
      );
    },

    runParams() {
      return actionCreators.prepareSingleQueryRunData(this.state.configId, this.state.query, 'detail');
    },

    handleActiveChange(newValue) {
      actionCreators.changeQueryEnabledState(this.state.configId, this.state.query.get('id'), newValue);
    }

  });
}
