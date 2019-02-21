import React from 'react';

// stores
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import VersionsStore from '../../../../components/stores/VersionsStore';
import makeConfigProvisioning from '../../../configProvisioning';
import makeLocalStateProvisioning from '../../../localStateProvisioning';
import GoodDataProvisioningStore from '../../../gooddataProvisioning/store';

// helpers
import tablesProvisioning from '../../../tablesProvisioning';
import dimensionsAdapter from '../../../adapters/dimensionsAdapter';
import credentialsAdapter from '../../../adapters/credentialsAdapter';
import tablesLoadSettingsAdapter from '../../../adapters/tablesLoadSettingsAdapter';

// components
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import {CollapsibleSection} from '../../../../configurations/utils/renderHelpers';
import NewTableButton from './NewTableButton';
import ConfiguredTables from './ConfiguredTables';
import DimensionsSection from '../../components/DimensionsSection';
import CredentialsContainer from '../../components/CredentialsContainer';
import TablesLoadSettings from '../../components/TablesLoadSettings';

const COMPONENT_ID = 'keboola.gooddata-writer';

const DimensionsCollapsibleComponent = CollapsibleSection({
  title: 'Date Dimensions',
  contentComponent: DimensionsSection,
  options: {stretchContentToBody: true}
});

const CredentialsCollapsibleComponent = CollapsibleSection({
  title: 'GoodData Project',
  contentComponent: CredentialsContainer
});

const LoadSettingsCollapsibleComponent = CollapsibleSection({
  title: 'Tables load settings',
  contentComponent: TablesLoadSettings
});

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, VersionsStore, GoodDataProvisioningStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const {tables, deleteTable, createNewTable, toggleTableExport, getSingleRunParams} = tablesProvisioning(configurationId);
    const configProvisioning = makeConfigProvisioning(configurationId);
    const {isSaving, isPendingFn} = configProvisioning;
    const localStateProvisioning = makeLocalStateProvisioning(configurationId);

    // section props
    const dimensionsSectionProps = dimensionsAdapter(configProvisioning, localStateProvisioning);

    const tableLoadSettingsSectionProps = tablesLoadSettingsAdapter(configProvisioning);
    const credentialsSectionProps = credentialsAdapter(configProvisioning, localStateProvisioning);

    return {
      dimensionsSectionProps,
      tableLoadSettingsSectionProps,
      credentialsSectionProps,
      getSingleRunParams,
      configurationId,
      isPendingFn,
      isSaving,
      tables,
      deleteTable,
      createNewTable,
      toggleTableExport
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
          {this.renderLoadSettings()}
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
          <SidebarJobsContainer
            componentId={COMPONENT_ID}
            configId={this.state.configurationId}
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
    return (
      <DimensionsCollapsibleComponent
        {...this.state.dimensionsSectionProps}
      />
    );
  },

  renderLoadSettings() {
    return (
      <LoadSettingsCollapsibleComponent
        {...this.state.tableLoadSettingsSectionProps}
        isComplete={true}
      />
    );
  },

  renderCredentials() {
    return (
      <CredentialsCollapsibleComponent
        {...this.state.credentialsSectionProps}
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
          loadOnly={this.state.tableLoadSettingsSectionProps.value.loadOnly}
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
        createdTables={this.state.tables}
        onCreateTable={this.createNewTableAndRedirect}
      />
    );
  },

  createNewTableAndRedirect(tableId, title) {
    const router = RoutesStore.getRouter();
    return this.state.createNewTable(tableId, title).then(() =>
      router.transitionTo('keboola.gooddata-writer-table', {config: this.state.configurationId, table: tableId})
    );
  },

  renderRunModalContent() {
    return (
      <span>
        <p>
          You are about to run load of all tables.
        </p>
      </span>
    );
  }
});
