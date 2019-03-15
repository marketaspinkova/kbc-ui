import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../ActionCreators';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import { RefreshIcon } from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  getStateFromStores() {
    return { isLoading: OrchestrationsStore.getIsLoading() };
  },

  _handleRefreshClick() {
    return OrchestrationsActionCreators.loadOrchestrationsForce();
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
  }
});
