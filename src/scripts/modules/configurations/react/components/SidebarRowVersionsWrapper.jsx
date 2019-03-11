import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import SidebarVesions from '../../../components/react/components/SidebarVersions';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentStore from '../../../components/stores/InstalledComponentsStore';
import ComponentStore from '../../../components/stores/ComponentsStore';
import VersionsStore from '../../../components/stores/VersionsStore';
import RowVersionsActionCreators from '../../RowVersionsActionCreators';
import RowVersionsStore from '../../RowVersionsStore';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentStore, ComponentStore, VersionsStore, RowVersionsStore)],

  getStateFromStores() {
    const { componentId, configId, rowId } = this.props;
    const versionsLinkTo = componentId + '-row-versions';
    const versionsLinkParams = {
      component: componentId,
      config: configId,
      row: rowId
    };

    return {
      versionsLinkTo,
      versionsLinkParams,
      rowVersions: RowVersionsStore.getVersions(componentId, configId, rowId),
      isLoading: RowVersionsStore.isLoadingVersions(componentId, configId, rowId),
      versionsConfigs: RowVersionsStore.getVersionsConfigs(componentId, configId, rowId),
      pendingMultiLoad: RowVersionsStore.getPendingMultiLoad(componentId, configId, rowId),
      isPending: RowVersionsStore.isPendingConfig(componentId, configId, rowId)
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
        versions={this.state.rowVersions}
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
    return RowVersionsActionCreators.loadTwoComponentConfigVersions(
      this.props.componentId,
      this.props.configId,
      this.props.rowId,
      version1.get('version'),
      version2.get('version')
    );
  }
});
