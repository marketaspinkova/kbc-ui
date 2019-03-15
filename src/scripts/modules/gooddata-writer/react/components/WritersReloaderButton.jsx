import {RefreshIcon} from '@keboola/indigo-ui';
import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import GoodDataWriterStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import actionCreators from '../../actionCreators';

export default createReactClass({
  mixins: [createStoreMixin(GoodDataWriterStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    return {
      isLoading: GoodDataWriterStore.getWriter(configId).get('isLoading'),
      configId: configId
    };
  },

  render() {
    return (
      <RefreshIcon
        isLoading={this.state.isLoading}
        onClick={this.handleClick}
      />
    );
  },

  handleClick() {
    actionCreators.loadConfigurationForce(this.state.configId);
  }

});
