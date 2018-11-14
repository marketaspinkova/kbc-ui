import React from 'react';
import { Map } from 'immutable';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import WrDbStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import ActionCreators from '../../actionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import { States } from '../pages/credentials/StateConstants';

export default (componentId, isProvisioning) => {
  return React.createClass({
    mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');

      return {
        configId,
        currentCredentials: WrDbStore.getCredentials(componentId, configId),
        localState: InstalledComponentsStore.getLocalState(componentId, configId)
      };
    },

    handleReset() {
      if (this.state.currentCredentials.count()) {
        return ActionCreators.saveCredentials(componentId, this.state.configId, Map()).then(() => {
          this.setInitState();
        });
      }

      this.setInitState();
    },

    render() {
      const state = this.state.localState.get('credentialsState');

      if (
        !isProvisioning ||
        ![States.SHOW_STORED_CREDS, States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS].includes(state)
      ) {
        return null;
      }

      return <div>{this.resetButton()}</div>;
    },

    resetButton() {
      return (
        <button className="btn btn-link" onClick={this.handleReset}>
          <span className="fa fa-fw fa-times" />
          {' Reset Credentials'}
        </button>
      );
    },

    setInitState() {
      InstalledComponentsActions.updateLocalState(
        componentId,
        this.state.configId,
        this.state.localState.set('credentialsState', States.INIT)
      );
    }
  });
};
