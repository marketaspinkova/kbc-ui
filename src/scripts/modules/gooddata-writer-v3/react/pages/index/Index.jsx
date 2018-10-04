import React from 'react';
import {Map} from 'immutable';

// stores
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import VersionsStore from '../../../../components/stores/VersionsStore';
import storeProvisioning from '../../../storeProvisioning';

// components
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import LatestJobs from '../../../../components/react/components/SidebarJobs';
import NewTableButton from './NewTableButton';
import ConfiguredTables from './ConfiguredTables';

const COMPONENT_ID = 'keboola.gooddata-writer';

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, LatestJobsStore, VersionsStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const {tables, isPending, saveTable} = storeProvisioning(configurationId);
    return {
      saveTable,
      isPending,
      configurationId,
      tables,
      latestJobs: LatestJobsStore.getJobs(COMPONENT_ID, configurationId)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription
              componentId={COMPONENT_ID}
              configId={this.state.configurationId}
            />
          </div>
          {this.renderTables()}
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            componentId={COMPONENT_ID}
            configId={this.state.configurationId}
          />
          <ul className="nav nav-stacked">
            <li>
              <RunComponentButton
                title="Run"
                component={COMPONENT_ID}
                mode="link"
                runParams={() => ({config: this.state.configurationId})}
              >
                {this.renderRunModalContent()}
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configurationId}
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

  renderTables() {
    const {tables} = this.state;
    if (tables.count() === 0) {
      return (
        <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
          <div className="component-empty-state text-center">
            <p>No tables created yet.</p>
            {this.renderNewTableButton()}
          </div>
        </div>);
    } else {
      return (
        <ConfiguredTables
          tables={this.state.tables}
          isSaving={false}
          isTablePending={this.IsPendingTODO}
          newTableButton={this.renderNewTableButton()}
        />
      );
    }
  },

  renderNewTableButton() {
    return (
      <NewTableButton
        onCreateTable={(tableId) => this.state.saveTable(tableId, Map({title: tableId}), 'create table')}
      />
    );
  },

  renderRunModalContent() {
    return (
      <span>
        <p>
          You are about to run upload.
        </p>
      </span>
    );
  },

  renderRowsTable() {
    return (
      <div>
        table
      </div>
    );
  }
});
