import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import OrchestrationActionCreators from '../../ActionCreators';

import { RefreshIcon } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  getStateFromStores() {
    return { isLoading: InstalledComponentsStore.getIsLoading() };
  },

  _handleRefreshClick() {
    InstalledComponentsActionCreators.loadComponentsForce();
    return OrchestrationActionCreators.loadOrchestrationsForce();
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
  }
});
