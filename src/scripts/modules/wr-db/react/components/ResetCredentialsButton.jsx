import React from 'react';
import { Map } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
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
        savingCredentials: WrDbStore.getSavingCredentials(componentId, configId),
        localState: InstalledComponentsStore.getLocalState(componentId, configId)
      };
    },

    render() {
      const state = this.state.localState.get('credentialsState');

      if (
        !isProvisioning ||
        ![States.SHOW_STORED_CREDS, States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS].includes(state)
      ) {
        return null;
      }

      return (
        <div>
          <button onClick={this.handleReset} disabled={this.state.savingCredentials} className="btn btn-link">
            {this.state.savingCredentials ? <Loader /> : <span className="fa fa-fw fa-times" />}
            {' Reset Credentials'}
          </button>
        </div>
      );
    },

    handleReset() {
      if (this.state.currentCredentials.count()) {
        return ActionCreators.saveCredentials(componentId, this.state.configId, Map()).then(() => {
          this.setInitState();
        });
      }

      this.setInitState();
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
