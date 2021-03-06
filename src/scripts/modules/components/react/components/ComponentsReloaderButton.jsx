import React from 'react';
import createReactClass from 'create-react-class';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import { RefreshIcon } from '@keboola/indigo-ui';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  getStateFromStores() {
    return { isLoading: InstalledComponentsStore.getIsLoading() || InstalledComponentsStore.getIsDeletedLoading() };
  },

  _handleRefreshClick() {
    InstalledComponentsActionCreators.loadComponentsForce();
  },

  render() {
    return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
  }
});
