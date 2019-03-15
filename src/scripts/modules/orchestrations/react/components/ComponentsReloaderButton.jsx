import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import OrchestrationActionCreators from '../../ActionCreators';

import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
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
