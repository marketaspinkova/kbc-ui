import React from 'react';

// stores
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import VersionsStore from '../../../../components/stores/VersionsStore';
import configProvisioning from '../../../configProvisioning';

// helpers
import tablesProvisioning from '../../../tablesProvisioning';
import dimensionsAdapter from '../../../dimensionsAdapter';
import credentialsAdapter from '../../../credentialsAdapter';

// components
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import LatestJobs from '../../../../components/react/components/SidebarJobs';
import {CollapsibleSection} from '../../../../configurations/utils/renderHelpers';
import NewTableButton from './NewTableButton';
import ConfiguredTables from './ConfiguredTables';
import DimensionsSection from '../../components/DimensionsSection';
import CredentialsContainer from '../../components/CredentialsContainer';

const COMPONENT_ID = 'keboola.gooddata-writer';

const DimensionsCollapsibleComponent = CollapsibleSection({
  title: 'Date Dimensions',
  contentComponent: DimensionsSection,
  options: {stretchContentToBody: true}
});

const CredentialsCollapsibleComponent = CollapsibleSection({
  title: 'Gooddata Project',
  contentComponent: CredentialsContainer
});

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, LatestJobsStore, VersionsStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const {tables, deleteTable, createNewTable, toggleTableExport, getSingleRunParams} = tablesProvisioning(configurationId);
    const {isSaving, isPendingFn} = configProvisioning(configurationId);
    return {
      getSingleRunParams,
      configurationId,
      isPendingFn,
      isSaving,
      tables,
      deleteTable,
      createNewTable,
      toggleTableExport,
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
          {this.renderCredentials()}
          {this.renderDimensions()}
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

  renderDimensions() {
    const componentProps = dimensionsAdapter(this.state.configurationId);
    return (
      <DimensionsCollapsibleComponent
        {...componentProps}
      />
    );
  },

  renderCredentials() {
    const componentProps = credentialsAdapter(this.state.configurationId);
    return (
      <CredentialsCollapsibleComponent
        {...componentProps}
      />
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
          configurationId={this.state.configurationId}
          tables={this.state.tables}
          isSaving={this.state.isSaving}
          isTablePending={this.state.isPendingFn}
          toggleTableExport={this.state.toggleTableExport}
          newTableButton={this.renderNewTableButton()}
          deleteTable={this.state.deleteTable}
          getSingleRunParams={this.state.getSingleRunParams}
        />
      );
    }
  },

  renderNewTableButton() {
    return (
      <NewTableButton
        onCreateTable={this.createNewTableAndRedirect}
      />
    );
  },

  createNewTableAndRedirect(tableId) {
    const router = RoutesStore.getRouter();
    return this.state.createNewTable(tableId).then(() =>
      router.transitionTo('keboola.gooddata-writer-table', {config: this.state.configurationId, table: tableId})
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
  }
});
