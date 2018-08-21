import React from 'react';

// stores
import ComponentsStore from '../../../components/stores/ComponentsStore';
import ConfigurationsStore from '../../ConfigurationsStore';
import RoutesStore from '../../../../stores/RoutesStore';

import Index from './Index';
import GenericDockerDetail from '../../../components/react/pages/GenericDockerDetail';
import LegacyUIMigration from '../components/LegacyUIMigration';
import ConfigurationRowsStore from '../../ConfigurationRowsStore';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ConfigurationsStore, ConfigurationRowsStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const settings = RoutesStore.getRouteSettings();
    const componentId = settings.get('componentId');
    const configuration = ConfigurationsStore.get(componentId, configurationId);
    return {
      componentId: componentId,
      component: ComponentsStore.getComponent(componentId),
      settings: settings,
      configurationId: configurationId,
      configuration: configuration
    };
  },

  render() {
    if (!this.state.settings.getIn(['legacyUI', 'isMigrated'])(this.state.configuration)) {
      return (
        <div>
          <LegacyUIMigration />
          <GenericDockerDetail />
        </div>
      );
    }
    return (
      <Index />
    );
  }
});
