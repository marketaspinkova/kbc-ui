import React from 'react';

// stores
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';

// components
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import RunLoadButton from '../../components/RunLoadButton';
import Tooltip from '../../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import TitleSection from '../../components/TitleSection';
import SaveButtons from '../../../../../react/common/SaveButtons';
import LoadTypeSectionTitle from '../../components/LoadTypeSectionTitle';
import LoadTypeSection from '../../components/LoadTypeSection';
import StorageTableColumnsEditor from '../../../../configurations/react/components/StorageTableColumnsEditor';

// helpers
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import makeTablesProvisioning from '../../../tablesProvisioning';
import makeConfigProvisioning from '../../../configProvisioning';
import titleAdapter from '../../../adapters/titleAdapter';
import {CollapsibleSection} from '../../../../configurations/utils/renderHelpers';
import loadTypeAdater from '../../../adapters/loadTypeAdapter';
import columnsEditorAdapter from '../../../adapters/columnsEditorAdapter';
import tableLoadSettingsAdapter from '../../../adapters/tablesLoadSettingsAdapter';

const LoadTypeCollapsibleComponent = CollapsibleSection({
  title: LoadTypeSectionTitle,
  contentComponent: LoadTypeSection
});

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, TablesStore)],
  getStateFromStores() {
    const tableId = RoutesStore.getCurrentRouteParam('table');
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const tablesProvisioning = makeTablesProvisioning(configurationId);
    const {tables, toggleTableExport, deleteTable, isEditingTableChanged, saveEditingTable, resetEditingTable, getSingleRunParams} = tablesProvisioning;
    const table = tables.get(tableId);
    const configProvisioning = makeConfigProvisioning(configurationId);
    const {isSaving, isPendingFn} = configProvisioning;
    const storageTable = TablesStore.get(tableId);
    const isPendingToggleExport = isPendingFn([tableId, 'activate']);
    const loadOnly = tableLoadSettingsAdapter(configProvisioning).value.loadOnly;

    // section props adapters
    const titleSectionProps = titleAdapter(configProvisioning, tablesProvisioning, tableId);
    const columnsEditorSectionProps = columnsEditorAdapter(configProvisioning, tablesProvisioning, storageTable, tableId);

    const loadTypeSectionProps = loadTypeAdater(configProvisioning, tablesProvisioning, tableId);

    return {
      titleSectionProps,
      columnsEditorSectionProps,
      loadTypeSectionProps,
      isPendingToggleExport,
      deleteTable,
      toggleTableExport,
      isSaving: isSaving && !isPendingToggleExport,
      isPendingFn,
      tableId,
      configurationId,
      table,
      saveEditingTable,
      resetEditingTable,
      getSingleRunParams,
      isChanged: isEditingTableChanged(tableId),
      loadOnly
    };
  },


  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          {this.renderButtons()}
          {this.renderSections()}
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          {this.renderActionsSideBar()}
        </div>
      </div>
    );
  },

  renderSections() {
    return (
      <div>
        <div className="kbc-inner-padding">
          <TitleSection
            {...this.state.titleSectionProps}
            disabled={this.state.isSaving}
          />
        </div>
        <LoadTypeCollapsibleComponent
          {...this.state.loadTypeSectionProps}
          disabled={this.state.isSaving}
        />
        <div className="kbc-inner-padding">
          <StorageTableColumnsEditor
            {...this.state.columnsEditorSectionProps}
            disabled={this.state.isSaving}
          />
        </div>
      </div>
    );
  },

  renderButtons() {
    const {isSaving, isPendingToggleExport, isChanged, saveEditingTable, tableId, resetEditingTable} = this.state;

    return (
      <div className="kbc-inner-padding">
        <div className="text-right">
          <SaveButtons
            disabled={isPendingToggleExport}
            isSaving={isSaving}
            isChanged={isChanged}
            onSave={() => saveEditingTable(tableId)}
            onReset={() => resetEditingTable(tableId)}
          />
        </div>
      </div>
    );
  },

  renderActionsSideBar() {
    const {table, tableId, isPendingFn, toggleTableExport, isSaving} = this.state;
    const isTableDisabled = table.get('disabled');
    return (
      <ul className="nav nav-stacked">
        <li>
          <RunLoadButton
            loadOnly={this.state.loadOnly}
            tableId={tableId}
            isTableDisabled={isTableDisabled}
            buttonMode="link"
            getRunParams={this.state.getSingleRunParams}
          />
        </li>
        <li>
          <ActivateDeactivateButton
            key="activate"
            activateTooltip="Enable"
            deactivateTooltip="Disable"
            mode="link"
            isActive={!isTableDisabled}
            isPending={isPendingFn([tableId, 'activate'])}
            onChange={val => toggleTableExport(tableId, val)}
          />
        </li>
        <li>
          <Tooltip placement="top" tooltip="delete">
            <a disabled={isSaving} onClick={this.deleteTableAndRedirect}>
              { isPendingFn([tableId, 'delete'])
                ? <Loader className="fa-fw"/>
                : <i className="kbc-icon-cup fa fa-fw"/>
              }
              {' Delete'}
            </a>
          </Tooltip>
        </li>
      </ul>
    );
  },

  deleteTableAndRedirect() {
    RoutesStore.getRouter().transitionTo( 'keboola.gooddata-writer', {config: this.state.configurationId});
    this.state.deleteTable(this.state.tableId);
  }

});
