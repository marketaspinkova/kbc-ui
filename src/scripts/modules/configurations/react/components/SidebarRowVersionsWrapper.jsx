import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import SidebarVesions from '../../../components/react/components/SidebarVersions';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentStore from '../../../components/stores/InstalledComponentsStore';
import ComponentStore from '../../../components/stores/ComponentsStore';
import VersionsStore from '../../RowVersionsStore';
import VersionsActionCreators from '../../RowVersionsActionCreators';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore)],

  getStateFromStores: function() {
    const versionsLinkTo = this.props.componentId + '-row-versions';
    const versionsLinkParams = {
      component: this.props.componentId,
      config: this.props.configId,
      row: this.props.rowId
    };

    return {
      versions: VersionsStore.getVersions(this.props.componentId, this.props.configId, this.props.rowId),
      isLoading: false,
      versionsLinkTo: versionsLinkTo,
      versionsLinkParams: versionsLinkParams,
      versionsConfigs: VersionsStore.getVersionsConfigs(this.props.componentId, this.props.configId, this.props.rowId),
      pendingMultiLoad: VersionsStore.getPendingMultiLoad(this.props.componentId, this.props.configId, this.props.rowId),
      isPending: VersionsStore.isPendingConfig(this.props.componentId, this.props.configId, this.props.rowId)
    };
  },

  propTypes: {
    limit: PropTypes.number,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      limit: 5
    };
  },

  render: function() {
    return (
      <SidebarVesions
        versions={this.state.versions}
        isLoading={this.state.isLoading}
        configId={this.props.configId}
        componentId={this.props.componentId}
        rowId={this.props.rowId}
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
    const configId = this.props.configId;
    const rowId = this.props.rowId;
    return VersionsActionCreators.loadTwoComponentConfigVersions(
      this.props.componentId, configId, rowId, version1.get('version'), version2.get('version'));
  }

});
