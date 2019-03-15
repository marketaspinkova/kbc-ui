import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../ActionCreators';
import OrchestrationJobsStore from '../../stores/OrchestrationJobsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationJobsStore)],

  _getJobId() {
    return RoutesStore.getCurrentRouteIntParam('jobId');
  },

  getStateFromStores() {
    return { isLoading: OrchestrationJobsStore.isJobLoading(this._getJobId()) };
  },

  _handleRefreshClick() {
    return OrchestrationsActionCreators.loadJobForce(this._getJobId());
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
  }
});
