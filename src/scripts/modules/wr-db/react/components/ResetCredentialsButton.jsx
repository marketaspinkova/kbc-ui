import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
import { Button } from 'react-bootstrap';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import WrDbStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import ActionCreators from '../../actionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import { States } from '../pages/credentials/StateConstants';

const renderForState = [States.SHOW_STORED_CREDS, States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS];

export default (componentId, isProvisioning) => {
  return createReactClass({
    mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');

      return {
        configId,
        currentCredentials: WrDbStore.getCredentials(componentId, configId),
        localState: InstalledComponentsStore.getLocalState(componentId, configId)
      };
    },

    getInitialState() {
      return {
        isLoading: false
      };
    },

    render() {
      const state = this.state.localState.get('credentialsState');

      if (!isProvisioning || !renderForState.includes(state)) {
        return null;
      }

      return (
        <div>
          <Button bsStyle="link" onClick={this.handleReset} disabled={this.state.isLoading}>
            {this.state.isLoading ? <Loader /> : <i className="fa fa-fw fa-times" />}
            {' Reset Credentials'}
          </Button>
        </div>
      );
    },

    handleReset() {
      if (this.state.currentCredentials.count()) {
        this.loading(true);
        return ActionCreators.saveCredentials(componentId, this.state.configId, Map()).then(() => {
          this.loading(false);
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
    },

    loading(state) {
      this.setState({
        isLoading: state
      });
    }
  });
};
