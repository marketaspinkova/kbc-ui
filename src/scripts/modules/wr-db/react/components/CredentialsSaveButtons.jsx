import React from 'react';
import _ from 'underscore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import WrDbStore from '../../store';
import RoutesStore from '../../../../stores/RoutesStore';
import ActionCreators from '../../actionCreators';
import { Navigation } from 'react-router';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import { States } from '../pages/credentials/StateConstants';
import SaveButtons from '../../../../react/common/SaveButtons';
import credentialsUtils from '../../credentialsUtils';

export default React.createClass({
  mixins: [createStoreMixin(WrDbStore, InstalledComponentsStore), Navigation],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    driver: React.PropTypes.string.isRequired
  },

  getStateFromStores() {
    const localState = InstalledComponentsStore.getLocalState(this.props.componentId, this.props.configId);
    const currentCredentials = WrDbStore.getCredentials(this.props.componentId, this.props.configId);
    const editingCredentials = WrDbStore.getEditingByPath(this.props.componentId, this.props.configId, 'creds');
    const defaultCredentials = credentialsUtils.defaultCredentials(
      this.props.componentId,
      this.props.driver,
      currentCredentials
    );

    return {
      editingCredsValid: credentialsUtils.hasDbConnection(this.props.componentId, editingCredentials),
      editingCredentials,
      currentCredentials,
      isEditing: !defaultCredentials.equals(editingCredentials),
      credsState: localState.get('credentialsState'),
      isSaving: localState.get('credentialsState') === States.SAVING_NEW_CREDS,
      localState
    };
  },

  render() {
    if (![States.CREATE_NEW_CREDS, States.SAVING_NEW_CREDS].includes(this.state.credsState)) {
      return null;
    }

    return (
      <div className="clearfix">
        <div className="pull-right">
          <SaveButtons
            isSaving={this.state.isSaving}
            isChanged={this.state.isEditing}
            disabled={this.state.isSaving || !this.state.editingCredsValid}
            onReset={this.handleReset}
            onSave={this.handleSave}
          />
        </div>
      </div>
    );
  },

  handleReset() {
    ActionCreators.setEditingData(
      this.props.componentId,
      this.props.configId,
      'creds',
      credentialsUtils.defaultCredentials(this.props.componentId, this.props.driver, this.state.currentCredentials)
    );
  },

  handleSave() {
    this.updateLocalState('credentialsState', States.SAVING_NEW_CREDS);

    const editingCredentials = this.state.editingCredentials.map((value, key) => {
      const isHashed = key[0] === '#';
      if (isHashed && _.isEmpty(value)) {
        return this.state.currentCredentials.get(key);
      } else {
        return value;
      }
    });

    ActionCreators.saveCredentials(this.props.componentId, this.props.configId, editingCredentials).then(() => {
      this.updateLocalState('credentialsState', States.SHOW_STORED_CREDS);
      RoutesStore.getRouter().transitionTo(this.props.componentId, { config: this.props.configId });
    });
  },

  updateLocalState(path, data) {
    InstalledComponentsActions.updateLocalState(
      this.props.componentId,
      this.props.configId,
      this.state.localState.setIn(path, data)
    );
  }
});
