import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import SidebarVesions from '../../../components/react/components/SidebarVersions';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentStore from '../../../components/stores/InstalledComponentsStore';
import ComponentStore from '../../../components/stores/ComponentsStore';
import VersionsActionCreators from '../../RowVersionsActionCreators';
import VersionsStore from '../../RowVersionsStore';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore)],

  getStateFromStores() {
    const versionsLinkTo = this.props.componentId + '-row-versions';
    const versionsLinkParams = {
      component: this.props.componentId,
      config: this.props.configId,
      row: this.props.rowId
    };

    return {
      versionsLinkTo,
      versionsLinkParams,
      versions: VersionsStore.getVersions(this.props.componentId, this.props.configId, this.props.rowId),
      isLoading: VersionsStore.isLoadingVersions(this.props.componentId, this.props.configId, this.props.rowId),
      versionsConfigs: VersionsStore.getVersionsConfigs(this.props.componentId, this.props.configId, this.props.rowId),
      pendingMultiLoad: VersionsStore.getPendingMultiLoad(this.props.componentId, this.props.configId, this.props.rowId),
      isPending: VersionsStore.isPendingConfig(this.props.componentId, this.props.configId, this.props.rowId),
      isReloading: VersionsStore.isReloadingConfig(this.props.componentId, this.props.configId, this.props.rowId)
    };
  },

  propTypes: {
    limit: PropTypes.number,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      limit: 5
    };
  },

  render() {
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
        isReloading={this.state.isReloading}
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
