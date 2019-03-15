import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../ActionCreators';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  _getOrchestrationId() {
    return RoutesStore.getCurrentRouteIntParam('orchestrationId');
  },

  getStateFromStores() {
    return { isLoading: OrchestrationsStore.getIsOrchestrationLoading(this._getOrchestrationId()) };
  },

  _handleRefreshClick() {
    return OrchestrationsActionCreators.loadOrchestrationForce(this._getOrchestrationId());
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
  }
});
