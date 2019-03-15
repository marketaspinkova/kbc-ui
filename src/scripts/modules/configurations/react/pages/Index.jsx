import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';

// stores
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import ConfigurationRowsStore from '../../ConfigurationRowsStore';
import ConfigurationsStore from '../../ConfigurationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import VersionsStore from '../../../components/stores/VersionsStore';
import MigrationsStore from '../../MigrationsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

// actions
import configurationRowsActions from '../../ConfigurationRowsActionCreators';
import configurationsActions from '../../ConfigurationsActionCreators';

// global components
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';
import SidebarJobsContainer from '../../../components/react/components/SidebarJobsContainer';
import CreateConfigurationRowButton from '../components/CreateConfigurationRowButton';
import ConfigurationRows from '../components/ConfigurationRows';
import IndexSections from '../components/IndexSections';

// utils
import sections from '../../utils/sections';
import MigrationRow from "../../../components/react/components/MigrationRow";

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ConfigurationsStore, ConfigurationRowsStore, VersionsStore, MigrationsStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const settings = RoutesStore.getRouteSettings();
    const componentId = settings.get('componentId');
    const component = ComponentsStore.getComponent(componentId);
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    return {
      componentId: componentId,
      component: component,
      settings: settings,
      configurationId: configurationId,
      configuration: configuration,
      rows: ConfigurationRowsStore.getRows(componentId, configurationId),
      isChanged: ConfigurationsStore.isEditingConfiguration(componentId, configurationId),
      isDeprecated: component.get('flags').includes('deprecated'),
      deprecationReplacementComponentId: component.getIn(['uiOptions', 'replacementApp'])
    };
  },

  onRowCreated(rowId) {
    const transitionParams = {
      config: this.state.configurationId,
      row: rowId
    };
    RoutesStore.getRouter().transitionTo(this.state.componentId + '-row', transitionParams);
  },

  renderNewConfigRowButton() {
    const state = this.state;
    const settings = this.state.settings;
    return (
      <CreateConfigurationRowButton
        componentType={this.state.component.get('type')}
        objectName={state.settings.getIn(['row', 'name', 'singular'])}
        componentId={state.componentId}
        configId={state.configurationId}
        emptyConfig={sections.makeCreateEmptyFn(settings.getIn(['row', 'sections']))}
        onRowCreated={this.onRowCreated}
      />
    );
  },

  renderRowsTable() {
    const state = this.state;
    const settings = this.state.settings;
    if (this.state.rows.count() === 0) {
      return (
        <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
          <div className="component-empty-state text-center">
            <p>No {settings.getIn(['row', 'name', 'plural']).toLowerCase()} created yet.</p>
            {this.renderNewConfigRowButton()}
          </div>
        </div>);
    } else {
      const columns = this.state.settings.getIn(['row', 'columns']);
      const filter = this.state.settings.getIn(['row', 'searchFilter']);
      return (<ConfigurationRows
        key="rows"
        rows={this.state.rows.toList()}
        componentId={this.state.componentId}
        component={this.state.component}
        configurationId={this.state.configurationId}
        rowDelete={function(rowId) {
          const changeDescription = settings.getIn(['row', 'name', 'singular']) + ' ' + state.rows.get(rowId).get('name') + ' deleted';
          return configurationRowsActions.delete(state.componentId, state.configurationId, rowId, false, changeDescription);
        }}
        rowDeletePending={function(rowId) {
          return ConfigurationRowsStore.getPendingActions(state.componentId, state.configurationId, rowId).has('delete');
        }}
        rowEnableDisable={function(rowId) {
          if (state.rows.get(rowId).get('isDisabled', false)) {
            const changeDescription = settings.getIn(['row', 'name', 'singular']) + ' ' + state.rows.get(rowId).get('name') + ' enabled';
            return configurationRowsActions.enable(state.componentId, state.configurationId, rowId, changeDescription);
          } else {
            const changeDescription = settings.getIn(['row', 'name', 'singular']) + ' ' + state.rows.get(rowId).get('name') + ' disabled';
            return configurationRowsActions.disable(state.componentId, state.configurationId, rowId, changeDescription);
          }
        }}
        rowEnableDisablePending={function(rowId) {
          return ConfigurationRowsStore.getPendingActions(state.componentId, state.configurationId, rowId).has('disable') || ConfigurationRowsStore.getPendingActions(state.componentId, state.configurationId, rowId).has('enable');
        }}
        rowLinkTo={this.state.componentId + '-row'}
        onOrder={function(rowIds, movedRowId) {
          const changeDescription = settings.getIn(['row', 'name', 'plural']) + ' order changed';
          return configurationsActions.orderRows(state.componentId, state.configurationId, rowIds, movedRowId, changeDescription);
        }}
        orderPending={ConfigurationsStore.getPendingActions(state.componentId, state.configurationId).get('order-rows', Immutable.Map())}
        columns={columns}
        filter={filter}
        onRowCreated={this.onRowCreated}
        objectName={settings.getIn(['row', 'name', 'singular'])}
        rowCreateEmptyConfig={sections.makeCreateEmptyFn(settings.getIn(['row', 'sections']))}
      />);
    }
  },

  renderRunModalContent() {
    const configurationName = this.state.configuration.get('name', 'Untitled');
    let changedMessage = '';
    if (this.state.isChanged) {
      changedMessage = (<p><strong>{'The configuration has unsaved changes.'}</strong></p>);
    }
    return (
      <span>
        {changedMessage}
        <p>
          You are about to run {configurationName}.
        </p>
      </span>
    );
  },

  render() {
    const settings = this.state.settings;
    const sidebarCustomItems = settings.getIn(['index', 'sidebarCustomItems'], Immutable.List());
    return (
      <div className="container-fluid">
        {this.state.isDeprecated && (
          <MigrationRow
            componentId={this.state.componentId}
            replacementAppId={this.state.deprecationReplacementComponentId}
          />
        )}
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription
              componentId={this.state.componentId}
              configId={this.state.configurationId}
            />
          </div>
          <IndexSections />
          {this.renderRowsTable()}
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            componentId={this.state.componentId}
            configId={this.state.configurationId}
          />
          <ul className="nav nav-stacked">
            <li>
              <RunComponentButton
                title="Run"
                component={this.state.componentId}
                mode="link"
                runParams={() => ({config: this.state.configurationId})}
              >
                {this.renderRunModalContent()}
              </RunComponentButton>
            </li>
            {
              sidebarCustomItems.map((SidebarItem, index) => {
                return (
                  <li key={index}>
                    <SidebarItem
                      configuration={this.state.configuration}
                      onSaveConfiguration={(newConfig) => configurationsActions.updateConfiguration(this.state.componentId, this.state.configurationId, newConfig)}
                    />
                  </li>
                );
              })}
            <li>
              <DeleteConfigurationButton
                componentId={this.state.componentId}
                configId={this.state.configurationId}
              />
            </li>
          </ul>
          <SidebarJobsContainer
            componentId={this.state.componentId}
            configId={this.state.configurationId}
            limit={3}
          />
          <LatestVersions
            componentId={this.state.componentId}
          />
        </div>
      </div>
    );
  }
});
