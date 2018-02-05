import React from 'react';

import storeProvisioning, {storeMixins} from '../storeProvisioning';
import InstalledComponentStore from '../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../stores/RoutesStore';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import LatestJobsStore from '../../jobs/stores/LatestJobsStore';

// actions
import actionsProvisioning from '../actionsProvisioning';

// ui components
import ComponentMetadata from '../../components/react/components/ComponentMetadata';
import ComponentDescription from '../../components/react/components/ComponentDescription';
import {RefreshIcon} from '@keboola/indigo-ui';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';
import RunComponentButton from '../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import LatestJobs from '../../components/react/components/SidebarJobs';
import ConfigurationForm from './ConfigurationForm';
import StorageTablesStore from '../../components/stores/StorageTablesStore';
import StorageBucketsStore from '../../components/stores/StorageBucketsStore';


const COMPONENT_ID = 'keboola.ex-pigeon';

export default React.createClass({
  mixins: [createStoreMixin(...storeMixins, InstalledComponentStore, StorageTablesStore, StorageBucketsStore, LatestJobsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);

    return {
      configId: configId,
      store: store,
      actions: actions,
      tables: StorageTablesStore.getAll(),
      latestJobs: LatestJobsStore.getJobs(COMPONENT_ID, configId),
      localState: store.getLocalState(),
      settings: store.settings
    };
  },

  componentDidMount() {
    this.state.actions.requestEmailAndInitConfig();
  },


  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-content-padding-fix with-bottom-border">
            <ComponentDescription
              componentId={COMPONENT_ID}
              configId={this.state.configId}
            />
          </div>
          <div className="kbc-inner-content-padding-fix with-bottom-border">

            {this.state.store.requestedEmail ?
             <ConfigurationForm
               incremental={this.state.settings.get('incremental')}
               delimiter={this.state.settings.get('delimiter')}
               enclosure={this.state.settings.get('enclosure')}
               onChange={this.state.actions.editChange}
               requestedEmail={this.state.store.requestedEmail}
               componentId={COMPONENT_ID}
               configId={this.state.configId}
               actions={this.state.actions}
               localState={this.state.localState}
             />
             :
             this.renderInitConfig()
            }

          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            configId={this.state.configId}
            componentId={COMPONENT_ID}
          />
          <ul className="nav nav-stacked">
            <li className={!!this.invalidToRun() ? 'disabled' : null}>
              <RunComponentButton
                title="Run"
                component={COMPONENT_ID}
                mode="link"
                runParams={() => ({config: this.state.configId})}
                disabled={!!this.invalidToRun()}
                disabledReason={this.invalidToRun() ? this.invalidToRun() : null}
              >
                <span>You are about to run an extraction.</span>
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </li>
          </ul>
          <LatestJobs
            jobs={this.state.latestJobs}
            limit={3}
          />
          <LatestVersions
            componentId={COMPONENT_ID}
          />
        </div>
      </div>
    );
  },

  renderInitConfig() {
    if (this.state.store.error) {
      return this.renderError();
    } else {
      // if we either have email or it is being generated
      return (
        <p>
          <RefreshIcon isLoading={true}/>
          {' '}
          Generating email address, please wait.
        </p>
      );
    }
  },

  renderError() {
    const error = this.state.store.error;
    const code = error.code;
    let message = 'Unexpected error';
    try {
      const jsError = JSON.parse(error).error;
      message = jsError.message || jsError;
    } catch (e) {
      message = error.message || error;
    }

    return (
      <div className="alert alert-danger">
        Error: {message}
        <div>
          {code >= 500 ? error.get('exceptionId') : null}
        </div>
      </div>
    );
  },

  invalidToRun() {
    if (!this.state.settings.get('enclosure') || !this.state.settings.get('delimiter') || !this.state.settings.get('email')) {
      return 'Configuration has missing values';
    }
    if (this.state.localState.get('isChanged', false)) {
      return 'Configuration is not saved';
    }

    return false;
  }
});
