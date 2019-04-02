import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import {List, Map} from 'immutable';
import { InlineEditInput } from '@keboola/indigo-ui';

import createStoreMixin from '../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../stores/RoutesStore';
import LatestJobsStore from '../../jobs/stores/LatestJobsStore';
import StorageTablesStore from '../../components/stores/StorageTablesStore';

import TableInputMapping from '../../components/react/components/generic/TableInputMapping';
import ComponentDescription from '../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';

import InstalledComponentsActions from '../../components/InstalledComponentsActionCreators';

const componentId = 'custom-science';


export default createReactClass({

  mixins: [createStoreMixin(InstalledComponentsStore, LatestJobsStore, StorageTablesStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const configData = InstalledComponentsStore.getConfigData(componentId, configId);
    const localState = InstalledComponentsStore.getLocalState(componentId, configId);
    const editingConfigData = InstalledComponentsStore.getEditingConfigDataObject(componentId, configId);
    const savingData = InstalledComponentsStore.getSavingConfigData(componentId, configId) || Map();

    return {
      configId: configId,
      localState: localState,
      configData: configData,
      latestJobs: LatestJobsStore.getJobs(componentId, configId),
      pendingActions: InstalledComponentsStore.getPendingActions(componentId, configId),
      openMappings: InstalledComponentsStore.getOpenMappings(componentId, configId),
      tables: StorageTablesStore.getAll(),
      editingConfigData: editingConfigData,
      savingData: savingData
    };
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderMainContent()}
        {this.renderSidebar()}
      </div>

    );
  },

  renderMainContent() {
    return (
      <div className="col-md-9 kbc-main-content">
        <div className="row kbc-header">
          <ComponentDescription
            componentId={componentId}
            configId={this.state.configId}
          />
        </div>
        <div className="row">
          <div className="col-md-12">
            <TableInputMapping
              componentId={componentId}
              componentType="application"
              tables={this.state.tables}
              pendingActions={this.state.pendingActions}
              openMappings={this.state.openMappings}
              editingValue={this.state.editingConfigData.getIn(['storage', 'input', 'tables'], Map())}
              configId={this.state.configId}
              value={this.state.configData.getIn(['storage', 'input', 'tables'], List())}/>
          </div>
          <div className="col-md-12">
            <h2>Repisitory:</h2>
            <div className="col-md-3">
              Url:
            </div>
            <div className="col-md-9">
              {this.renderInlineEdit('url', 'https://github.com/somerepository', 'repository url')}
            </div>
            <div className="col-md-3">
              Commit:
            </div>
            <div className="col-md-9">
              {this.renderInlineEdit('commit', '10ab3f2b13b86896a0d4cddc3d1781a50e88ggfee', 'repository commit id')}
            </div>

          </div>

        </div>
      </div>
    );
  },

  renderInlineEdit(param, placeholder, tooltip) {
    const value = this.state.configData.getIn(['parameters', param], '');
    const editingValue = this.state.localState.getIn(['editing', param], '');
    const isEditing = this.state.localState.hasIn(['editing', param]);
    const isValid = !_.isEmpty(editingValue);
    const savingValue = this.state.savingData.getIn(['parameters', param]);


    return (
      <InlineEditInput
        text={isEditing ? editingValue : value}
        editTooltip={tooltip}
        placeholder={placeholder}
        onEditStart={this.onEditSet(param, value)}
        onEditCancel={this.onEditCancel(param)}
        onEditChange={this.onEditChange(param)}
        onEditSubmit={this.onSubmit(param)}
        isEditing={isEditing}
        isSaving={!!savingValue && savingValue !== value}
        isValid={isValid}
      />
    );
  },

  onEditCancel(param) {
    return () => {
      const editing = this.state.localState.get('editing').remove(param);
      this.updateLocalState(['editing'], editing);
    };
  },

  onSubmit(param) {
    return () => {
      const value = this.state.localState.getIn(['editing', param]);
      const newData = this.state.configData.setIn(['parameters', param], value);
      const saveFn = InstalledComponentsActions.saveComponentConfigData;
      return saveFn(componentId, this.state.configId, newData).then(() => {
        const editing = this.state.localState.get('editing').remove(param);
        this.updateLocalState(['editing'], editing);
      }
      );
    };
  },

  renderSidebar() {
    return (
      <div className="col-md-3 kbc-main-sidebar">
        <div className="kbc-buttons kbc-text-light">
          <ComponentMetadata
            componentId={componentId}
            configId={this.state.configId}
          />
        </div>
        <ul className="nav nav-stacked">
          <li>
            <RunComponentButton
              title="Run"
              component={componentId}
              mode="link"
              runParams={() => ({config: this.state.configId})}
            >
              You are about to run the component.
            </RunComponentButton>
          </li>
          <li>
            <DeleteConfigurationButton
              componentId={componentId}
              configId={this.state.configId}
            />
          </li>
        </ul>
      </div>
    );
  },

  onEditSet(param, value) {
    return () => this.updateLocalState(['editing'].concat(param), value);
  },

  onEditChange(param) {
    return (value) => this.updateLocalState(['editing'].concat(param), value);
  },

  updateLocalState(path, data) {
    const newLocalState = this.state.localState.setIn(path, data);
    InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  }

});
