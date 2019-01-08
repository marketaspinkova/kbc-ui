import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
// import { SearchBar } from '@keboola/indigo-ui';
// import SettingsTabs from '../../../../react/layout/SettingsTabs';
import SplashIcon from '../../../../react/common/SplashIcon';
import MigrationComponentRow from '../components/MigrationComponentRow';
import OAuthStore from '../../../oauth-v2/Store';
import MigrationButton from '../components/MigrationButton';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
// import {Map} from 'immutable';
// import moment from 'moment';

const MIGRATION_COMPONENT_ID = 'keboola.config-migration-tool';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore)],

  getStateFromStores() {
    return {
      components: InstalledComponentsStore.getAll()
    };
  },

  splashLabel() {
    if (this.state.filterName || this.state.filterType) {
      return 'No configurations found';
    }

    return 'Nothing to migrate';
  },

  render() {
    const components = this.getComponentsWithOAuth();

    return (
      <div className="container-fluid">
        <div className="kbc-main-content kbc-components-list">
          {/*
            <SettingsTabs active="settings-trash" />
            <div className="tab-content ">
              <div className="tab-pane tab-pane-no-padding active">
              */}

          <div className="kbc-header">
            <div className="jumbotron">
              <h2>OAuth Credentials Migration</h2>
              <p>Description of this migration</p>
              <hr />
              <MigrationButton
                key="migration-button"
                onClick={this.getOnMigrateFn(components)}
              />
            </div>
            <div className="row">
              <div className="col-md-12">
                <h4>Affected configurations:</h4>
              </div>
            </div>
          </div>
          {this.renderRows(components)}

          {/*
            </div>
          </div>
          */}
        </div>
      </div>
    );
  },

  renderRows(components) {
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
  },

  getOnMigrateFn(components) {
    const configurations = components.map(component => {
      return component.get('configurations').map(config => ({
        id: config.get('id'),
        componentId: component.get('id')
      }));
    }).flatten(1);

    return () => {
      this.setState({isLoading: true});

      const params = {
        method: 'run',
        component: MIGRATION_COMPONENT_ID,
        data: {
          configData: {
            parameters: {
              oauth: {
                configurations: configurations.toJS()
              }
            }
          }
        },
        notify: true
      };

      InstalledComponentsActionCreators
        .runComponent(params)
        .then(this.setState({isLoading: false}))
        .catch((error) => {
          this.setState({isLoading: false});
          throw error;
        });
    };
  }
});
