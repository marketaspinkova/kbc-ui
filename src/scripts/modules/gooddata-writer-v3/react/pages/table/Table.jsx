import React from 'react';

// stores
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';

// components
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import Tooltip from '../../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';

// helpers
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import tablesProvisioning from '../../../tablesProvisioning';
import configProvisioning from '../../../configProvisioning';

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore)],
  getStateFromStores() {
    const tableId = RoutesStore.getCurrentRouteParam('table');
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const {tables, toggleTableExport, deleteTable} = tablesProvisioning(configurationId);
    const table = tables.get(tableId);
    const {isSaving, isPendingFn} = configProvisioning(configurationId);
    return {
      deleteTable,
      toggleTableExport,
      isSaving,
      isPendingFn,
      tableId,
      configurationId,
      table
    };
  },


  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            inner content {this.state.tableId}
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          {this.renderActionsSideBar()}
        </div>
      </div>
    );
  },

  renderRunModalContent() {
    const {tableId, table} = this.state;
    if (table.get('disabled')) {
      return 'You are about to run ' + tableId + '. Configuration ' + tableId + ' is disabled and will be forced to run ';
    } else {
      return 'You are about to run load of' + tableId + ' table.';
    }
  },

  renderActionsSideBar() {
    const {table, tableId, isPendingFn, toggleTableExport, isSaving} = this.state;
    const isTableDisabled = table.get('disabled');
    return (
      <ul className="nav nav-stacked">
        <li>
          <RunComponentButton
            title="Run"
            component={this.state.componentId}
            mode="link"
            runParams={() => ({})}
          >
            {this.renderRunModalContent()}
          </RunComponentButton>
        </li>
        <li>
          <ActivateDeactivateButton
            key="activate"
            activateTooltip="Enable"
            deactivateTooltip="Disable"
            activateLabel="Enable"
            deactivateLabel="Disable"
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
