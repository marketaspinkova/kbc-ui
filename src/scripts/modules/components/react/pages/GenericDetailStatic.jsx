import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import InstalledComponentStore from '../../stores/InstalledComponentsStore';
import ComponentStore from '../../stores/ComponentsStore';
import VersionsStore from '../../stores/VersionsStore';

import ComponentDescription from '../components/ComponentDescription';
import ComponentMetadata from '../components/ComponentMetadata';
import RunComponentButton from '../components/RunComponentButton';
import DeleteConfigurationButton from '../components/DeleteConfigurationButton';
import SidebarJobsContainer from '../components/SidebarJobsContainer';
import contactSupport from '../../../../utils/contactSupport';
import LastUpdateInfo from '../../../../react/common/LastUpdateInfo';
import {Button} from 'react-bootstrap';
import LatestVersions from '../components/SidebarVersionsWrapper';


export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config'),
      componentId = RoutesStore.getCurrentRouteParam('component');

    return {
      componentId: componentId,
      configData: InstalledComponentStore.getConfigData(componentId, configId),
      versions: VersionsStore.getVersions(componentId, configId),
      config: InstalledComponentStore.getConfig(componentId, configId),
      component: ComponentStore.getComponent(componentId)
    };
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
            <p>This component has to be configured manually, please contact our support for assistance.</p>
            <div className="kbc-buttons">
              <Button onClick={contactSupport} bsStyle="success">
                Contact Support
              </Button>
            </div>
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

  runParams() {
    return () => ({config: this.state.config.get('id')});
  }
});
