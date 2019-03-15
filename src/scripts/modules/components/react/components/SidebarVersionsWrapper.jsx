import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import SidebarVesions from './SidebarVersions';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import InstalledComponentStore from '../../stores/InstalledComponentsStore';
import ComponentStore from '../../stores/ComponentsStore';
import VersionsStore from '../../stores/VersionsStore';
import VersionsActionCreators from '../../VersionsActionCreators';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore)],

  getStateFromStores: function() {
    const configId = RoutesStore.getCurrentRouteParam('config') || RoutesStore.getCurrentRouteParam('orchestrationId'),
      componentId = this.props.componentId || RoutesStore.getCurrentRouteParam('component'),
      component = ComponentStore.getComponent(componentId);

    var versionsLinkTo = null;
    var versionsLinkParams = null;

    if (component) {
      if (componentId === 'orchestrator') {
        versionsLinkTo = 'orchestrator-versions';
        versionsLinkParams = {
          orchestrationId: configId
        };
      } else {
        versionsLinkTo = component.get('type') + '-versions';
        versionsLinkParams = {
          component: componentId,
          config: configId
        };
      }
    }

    return {
      versions: VersionsStore.getVersions(componentId, configId),
      componentId: componentId,
      configId: configId,
      isLoading: false,
      versionsLinkTo: versionsLinkTo,
      versionsLinkParams: versionsLinkParams,
      versionsConfigs: VersionsStore.getVersionsConfigs(componentId, configId),
      pendingMultiLoad: VersionsStore.getPendingMultiLoad(componentId, configId),
      isPending: VersionsStore.isPendingConfig(componentId, configId)
    };
  },

  propTypes: {
    limit: PropTypes.number,
    componentId: PropTypes.string
  },

  getDefaultProps: function() {
    return {
      limit: 5
    };
  },

  render: function() {
    if (!this.state.versionsLinkTo) {
      return null;
    }
    return (
      <SidebarVesions
        versions={this.state.versions}
        isLoading={this.state.isLoading}
        configId={this.state.configId}
        componentId={this.state.componentId}
        versionsLinkTo={this.state.versionsLinkTo}
        versionsLinkParams={this.state.versionsLinkParams}
        limit={this.props.limit}
        prepareVersionsDiffData={this.prepareVersionsDiffData}
        versionsConfigs={this.state.versionsConfigs}
        pendingMultiLoad={this.state.pendingMultiLoad}
        isPending={this.state.isPending}
      />
    );
  },

  prepareVersionsDiffData(version1, version2) {
    const configId = this.state.configId;
    return VersionsActionCreators.loadTwoComponentConfigVersions(
      this.state.componentId, configId, version1.get('version'), version2.get('version'));
  }

});
