import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import OrchestrationActiveButton from './OrchestrationActiveButton';
import OrchestrationDeleteButton from './OrchestrationDeleteButton';
import OrchestrationRunButton from './OrchestrationRunButton';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  _getOrchestrationId() {
    return RoutesStore.getCurrentRouteIntParam('orchestrationId');
  },

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    return {
      orchestration: OrchestrationsStore.get(this._getOrchestrationId()),
      pendingActions: OrchestrationsStore.getPendingActionsForOrchestration(this._getOrchestrationId())
    };
  },

  render() {
    return (
      <span>
        <OrchestrationDeleteButton
          orchestration={this.state.orchestration}
          isPending={this.state.pendingActions.get('delete', false)}
          tooltipPlacement="bottom"
        />
        <OrchestrationActiveButton
          orchestration={this.state.orchestration}
          isPending={this.state.pendingActions.get('active', false)}
          tooltipPlacement="bottom"
        />
        <OrchestrationRunButton
          orchestration={this.state.orchestration}
          tasks={OrchestrationsStore.getTasksToRun(this._getOrchestrationId())}
          tooltipPlacement="bottom"
        />
      </span>
    );
  }
});
