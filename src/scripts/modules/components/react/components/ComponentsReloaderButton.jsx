import React from 'react';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import { RefreshIcon } from '@keboola/indigo-ui';
const createStoreMixin = require('../../../../react/mixins/createStoreMixin').default;
const InstalledComponentsStore = require('../../stores/InstalledComponentsStore').default;

export default React.createClass({
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
