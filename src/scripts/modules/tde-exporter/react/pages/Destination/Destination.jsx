import React from 'react';
import createReactClass from 'create-react-class';
import { List, Map, fromJS } from 'immutable';
import { Button } from 'react-bootstrap';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';

import ComponentName from '../../../../../react/common/ComponentName';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentEmptyState from '../../../../components/react/components/ComponentEmptyState';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import OAuthStore from '../../../../oauth-v2/Store';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import uploadUtils from '../../../uploadUtils';
import { OAUTH_V2_WRITERS } from '../../../tdeCommon';
import SelectWriterModal from './WritersModal';
import TableauServerRow from './TableauServerRow';
import OauthV2WriterRow from './OauthV2WriterRow';

const componentId = 'tde-exporter';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');

    return {
      configId,
      configData: InstalledComponentsStore.getConfigData(componentId, configId),
      localState: InstalledComponentsStore.getLocalState(componentId, configId),
      isSaving: InstalledComponentsStore.isSavingConfigData(componentId, configId),
      savingData: InstalledComponentsStore.getSavingConfigData(componentId, configId)
    };
  },

  render() {
    let destinationRow = (
      <ComponentEmptyState>
        <p>Upload destination is not chosen</p>
        <Button bsStyle="success" onClick={this._showWritersModal}>
          Choose Destination
        </Button>
      </ComponentEmptyState>
    );

    const task = this.state.configData.getIn(['parameters', 'stageUploadTask']);
    switch (task) {
      case 'tableauServer':
        destinationRow = this._renderTableauServer();
        break;
      default:
        break;
    }

    if (OAUTH_V2_WRITERS.includes(task)) {
      destinationRow = this._renderOAuthV2Writer(task);
    }

    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <SelectWriterModal
            isSaving={this.state.isSaving}
            localState={this.state.localState.get('writersModal', Map())}
            setLocalState={(key, value) => this._updateLocalState(['writersModal'].concat(key), value)}
            onChangeWriterFn={newTask => {
              let params = this.state.configData.get('parameters') || Map();
              params = params.set('stageUploadTask', newTask);
              params = params.set('uploadTasks', List());
              return this._saveConfigData(['parameters'], params).then(() => {
                return this._updateLocalState(['writersModal', 'show'], false);
              });
            }}
          />
          {destinationRow}
        </div>
      </div>
    );
  },

  _renderOAuthV2Writer(component) {
    const parameters = this.state.configData.get('parameters');
    const componentData = parameters.get(component, Map());
    const credentialsId = componentData.get('id');
    const oauthCredentials = credentialsId && OAuthStore.getCredentials(component, credentialsId);
    const isAuthorized = uploadUtils.isOauthV2Authorized(parameters, component) && oauthCredentials;

    return (
      <OauthV2WriterRow
        componentData={componentData}
        configId={this.state.configId}
        localState={this.state.localState}
        updateLocalState={this._updateLocalState}
        componentId={component}
        isAuthorized={isAuthorized}
        oauthCredentials={oauthCredentials}
        setConfigDataFn={this._saveConfigData}
        renderComponent={() => this._renderComponentCol(component)}
        renderEnableUpload={name => this._renderEnableUploadCol(component, isAuthorized, name)}
        resetUploadTask={() => this._resetUploadTask(component)}
      />
    );
  },

  _renderTableauServer() {
    const parameters = this.state.configData.get('parameters');
    const account = this.state.configData.getIn(['parameters', 'tableauServer']);
    const isAuthorized = uploadUtils.isTableauServerAuthorized(parameters);

    return (
      <TableauServerRow
        configId={this.state.configId}
        localState={this.state.localState}
        updateLocalStateFn={this._updateLocalState}
        account={account}
        setConfigDataFn={this._saveConfigData}
        renderComponent={() => this._renderComponentCol('wr-tableau-server')}
        renderEnableUpload={name => this._renderEnableUploadCol('tableauServer', isAuthorized, name)}
        resetUploadTask={() => this._resetUploadTask('tableauServer')}
      />
    );
  },

  _saveConfigData(path, data) {
    const newData = this.state.configData.setIn(path, data);
    return InstalledComponentsActions.saveComponentConfigData(componentId, this.state.configId, fromJS(newData));
  },

  _updateLocalState(path, data) {
    const newLocalState = this.state.localState.setIn(path, data);
    return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  },

  _renderComponentCol(id) {
    const component = ComponentsStore.getComponent(id);

    return (
      <span className="">
        <ComponentIcon component={component} size="32" />{' '}
        <span style={{ paddingRight: '1em' }}>
          <ComponentName component={component} />
        </span>{' '}
        <Button bsStyle="success" onClick={this._showWritersModal}>
          <i className="fa fa-cog" />
          {' Change'}
        </Button>
      </span>
    );
  },

  _showWritersModal() {
    return this._updateLocalState(['writersModal', 'show'], true);
  },

  _hasUploadTask(taskName) {
    const tasks = this.state.configData.getIn(['parameters', 'uploadTasks'], List());
    return !!tasks.find(t => t === taskName);
  },

  _toggleImmediateUpload(taskName, isActive) {
    const newTasks = isActive ? List() : List([taskName]);
    return this._saveConfigData(['parameters', 'uploadTasks'], newTasks);
  },

  _renderEnableUploadCol(componentKey, isAuthorized, accountName) {
    if (!isAuthorized) {
      return <div />;
    }

    const isActive = this._hasUploadTask(componentKey); // gdrive, dropbox, # tableauServer
    let isSaving = false;
    if (this.state.isSaving) {
      const savingTasks = this.state.savingData.getIn(['parameters', 'uploadTasks'], List());
      const hasTask = savingTasks.find(t => t === componentKey);
      if (isActive) {
        isSaving = !hasTask;
      } else {
        isSaving = !!hasTask;
      }
    }

    let helpText = `All TDE files will be uploaded to ${accountName} immediately after export.`;
    if (!isActive) {
      helpText = 'No instant upload of TDE files after export.';
    }
    return (
      <span>
        <span className="help-block">{helpText}</span>
        <ActivateDeactivateButton
          mode="link"
          key="active"
          activateTooltip="Enable instant upload"
          deactivateTooltip="Disable instant upload"
          isActive={isActive}
          isPending={isSaving}
          onChange={() => this._toggleImmediateUpload(componentKey, isActive)}
        />
      </span>
    );
  },

  _resetUploadTask(taskName) {
    let params = this.state.configData.getIn(['parameters'], Map());
    params = params.delete(taskName);
    params = params.set('uploadTasks', List());
    params = params.delete('stageUploadTask');
    return this._saveConfigData(['parameters'], params);
  }
});
