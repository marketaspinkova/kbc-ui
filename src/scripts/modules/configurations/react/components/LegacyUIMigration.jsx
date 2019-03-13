import React from 'react';

// stores
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import ConfigurationsStore from '../../ConfigurationsStore';
import MigrationsStore from '../../MigrationsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

// actions
import actions from '../../MigrationsActionCreators';

// components
import {Loader, AlertBlock} from '@keboola/indigo-ui';

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, ConfigurationsStore, MigrationsStore)],

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
      configuration: configuration,
      pending: MigrationsStore.isPendingLegacyUIMigration(componentId, configurationId)
    };
  },

  migrateConfig() {
    actions.migrateLegacyUI(this.state.componentId, this.state.configurationId, this.state.settings.get('legacyUI'));
  },

  renderButtonLabel() {
    if (this.state.pending) {
      return (
        <span>
          <Loader />
          {' '}
          Migrating Configuration
        </span>
      );
    }
    return 'Proceed to Migration';
  },

  render() {
    return (
      <AlertBlock type="warning" title="This configuration is in the legacy format">
        <div className="row">
          <div className="col-md-9">
            <p>Please migrate the configuration to the newest format to unlock the latest features.</p>
            <button
              className="btn btn-success"
              onClick={this.migrateConfig}
              disabled={this.state.pending}
            >
              {this.renderButtonLabel()}
            </button>
          </div>
        </div>
      </AlertBlock>
    );
  }
});
