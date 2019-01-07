import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import { SearchBar } from '@keboola/indigo-ui';
import SettingsTabs from '../../../../react/layout/SettingsTabs';
import SplashIcon from '../../../../react/common/SplashIcon';
import MigrationComponentRow from '../components/MigrationComponentRow';
import OAuthStore from '../../../oauth-v2/Store';
// import {Map} from 'immutable';
// import moment from 'moment';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore, OAuthStore)],

  getStateFromStores() {
    return {
      components: InstalledComponentsStore.getAll()
    };
  },

  splashLabel() {
    if (this.state.filterName || this.state.filterType) {
      return 'No configurations found';
    }

    return 'Trash is empty';
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content kbc-components-list">
          <SettingsTabs active="settings-trash" />
          <div className="tab-content ">
            <div className="row-searchbar row-searchbar-no-padding">
              <SearchBar
                query={this.state.filterName}
                onChange={query => this.handleFilterChange(query, 'name')}
                additionalActions={[]}
              />
            </div>
            <div className="tab-pane tab-pane-no-padding active">{this.renderRows()}</div>
          </div>
        </div>
      </div>
    );
  },

  renderRows() {
    let components = this.getComponentsWithOAuth();

    if (!components.count()) {
      return <SplashIcon icon="kbc-icon-cup" label={this.splashLabel()} />;
    }

    return components.map(component => (
      <MigrationComponentRow
        component={component}
        configurations={component.get('configurations')}
        key={component.id}
      />
    )).toArray();
  },

  getComponentsWithOAuth() {
    return this.state.components.filter(component => {
      return component.get('flags').contains('genericDockerUI-authorization');
    });
  }
});
