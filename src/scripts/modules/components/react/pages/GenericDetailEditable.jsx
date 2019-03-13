import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import InstalledComponentStore from '../../stores/InstalledComponentsStore';
import ComponentStore from '../../stores/ComponentsStore';
import ApplicationStore from '../../../../stores/ApplicationStore';
import VersionsStore from '../../stores/VersionsStore';

import Tooltip from '../../../../react/common/Tooltip';
import ComponentDescription from '../components/ComponentDescription';
import ComponentMetadata from '../components/ComponentMetadata';
import LastUpdateInfo from '../../../../react/common/LastUpdateInfo';
import RunComponentButton from '../components/RunComponentButton';
import DeleteConfigurationButton from '../components/DeleteConfigurationButton';
import SidebarJobsContainer from '../components/SidebarJobsContainer';
import Configuration from '../components/Configuration';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import Immutable from 'immutable';
import LatestVersions from '../components/SidebarVersionsWrapper';


export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config'),
      componentId = RoutesStore.getCurrentRouteParam('component'),
      token = ApplicationStore.getSapiTokenString();

    return {
      component: ComponentStore.getComponent(componentId),
      componentId: componentId,
      versions: VersionsStore.getVersions(componentId, configId),
      configData: InstalledComponentStore.getConfigData(componentId, configId),
      config: InstalledComponentStore.getConfig(componentId, configId),
      isChanged: InstalledComponentStore.isChangedRawConfigData(componentId, configId),
      isSaving: InstalledComponentStore.isSavingConfigData(componentId, configId),

      editingConfigData: InstalledComponentStore.getEditingRawConfigData(componentId, configId),
      isValidEditingConfigData: InstalledComponentStore.isValidEditingConfigData(componentId, configId),
      token: token
    };
  },

  documentationLink() {
    if (this.state.component.get('documentationUrl')) {
      return (
        <span>
          See the <ExternalLink href={this.state.component.get('documentationUrl')}>documentation</ExternalLink> for more details about this configuration.
        </span>
      );
    } else {
      return null;
    }
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <ComponentDescription
              componentId={this.state.componentId}
              configId={this.state.config.get('id')}
            />
          </div>
          <div className="row">
            {this.renderConfigurationHint()}
            <Configuration
              data={this.state.editingConfigData}
              isSaving={this.state.isSaving}
              onEditCancel={this.onEditCancel}
              onEditChange={this.onEditChange}
              isChanged={this.state.isChanged}
              onEditSubmit={this.onEditSubmit}
              isValid={this.state.isValidEditingConfigData}
              showDocumentationLink={!this.state.component.get('flags').contains('genericDockerUI-runtime')}
            />
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata
              componentId={this.state.componentId}
              configId={this.state.config.get('id')}
            />
            <LastUpdateInfo lastVersion={this.state.versions.get(0)} />
          </div>
          <ul className="nav nav-stacked">
            <li>
              <RunComponentButton
                title="Run"
                component={this.state.componentId}
                mode="link"
                runParams={this.runParams()}
              >
                You are about to run the component.
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={this.state.componentId}
                configId={this.state.config.get('id')}
              />
            </li>
            {this.renderShinyAppLink()}
          </ul>
          <SidebarJobsContainer
            componentId={this.state.componentId}
            configId={this.state.config.get('id')}
            limit={3}
          />
          <LatestVersions
            limit={3}
          />
        </div>
      </div>
    );
  },

  renderShinyAppLink() {
    const isShiny = this.state.component.get('flags').includes('genericShinyUI');

    if (isShiny) {
      const url = this.state.configData.get('url');
      const disabledClassName = url ? '' : 'disabled';
      const tooltip = url ? 'Visit shiny app' : 'No url specified';
      const label = (<span className="kbc-sapi-table-link"><i className="fa fa-fw fa-bar-chart" /> Shiny App</span>);
      return (
        <li className={disabledClassName}>
          <Tooltip tooltip={tooltip} placement="top">
            <form action={url} method="POST" target="_blank" >
              <input type="hidden" name="token" value={this.state.token}/>
              <button disabled={!url} className="btn btn-link" type="submit">
                {label}
              </button>
            </form>
          </Tooltip>
        </li>
      );
    } else {
      return false;
    }
  },

  runParams() {
    return () => ({config: this.state.config.get('id')});
  },

  onEditCancel() {
    InstalledComponentsActionCreators.cancelEditComponentRawConfigData(this.state.componentId, this.state.config.get('id'));
  },

  onEditChange(newValue) {
    InstalledComponentsActionCreators.updateEditComponentRawConfigData(this.state.componentId, this.state.config.get('id'), newValue);
  },

  onEditSubmit() {
    InstalledComponentsActionCreators.saveComponentRawConfigData(this.state.componentId, this.state.config.get('id'));
  },

  isTemplatedComponent() {
    return this.state.component.get('flags', Immutable.List()).includes('genericTemplatesUI');
  },

  renderConfigurationHint() {
    if (!this.isTemplatedComponent()) {
      return (<p className="help-block">This component has to be configured manually. {this.documentationLink()} </p>);
    }
    return null;
  }

});
