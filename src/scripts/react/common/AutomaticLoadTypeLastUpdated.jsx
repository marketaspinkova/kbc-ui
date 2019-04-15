import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';

import CreatedDate from './CreatedDate';
import ResetAutomaticLoadTypeButton from './ResetAutomaticLoadTypeButton';

import { constants } from '../../modules/configurations/utils/configurationState';
import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';
import ConfigurationRowActionCreators from '../../modules/configurations/ConfigurationRowsActionCreators';
import ConfigurationRowsStore from '../../modules/configurations/ConfigurationRowsStore';
import InstalledComponentsActionCreators from '../../modules/components/InstalledComponentsActionCreators';
import StorageTablesStore from '../../modules/components/stores/StorageTablesStore';

export default createReactClass({
  mixins: [createStoreMixin(RoutesStore, InstalledComponentsStore, ConfigurationRowsStore, StorageTablesStore)],

  propTypes: {
    tableId: PropTypes.string.isRequired
  },

  getStateFromStores() {
    const componentId = RoutesStore.getCurrentRouteComponentId();
    const configId = RoutesStore.getConfigId();
    const rowId = RoutesStore.getRowId();

    let configuration = Immutable.Map();
    if (rowId) {
      configuration = ConfigurationRowsStore.get(componentId, configId, rowId);
    } else {
      configuration = InstalledComponentsStore.getConfig(componentId, configId);
    }

    const configurationState = configuration.get('state', Immutable.Map());
    const tableState = configurationState
      .getIn(
        [constants.STORAGE_NAMESPACE, constants.INPUT_NAMESPACE, constants.TABLES_NAMESPACE],
        Immutable.Map()
      )
      .find((item) => item.get('source') === this.props.tableId);

    return {
      componentId,
      configId,
      rowId,
      table: StorageTablesStore.getTable(this.props.tableId),
      tableState: tableState,
      resetStatePending:
        ConfigurationRowsStore.getPendingActions(componentId, configId, rowId).has('clear-state') ||
        InstalledComponentsStore.getPendingActions(componentId, configId).has('clear-state')
    };
  },

  resetState() {
    if (this.state.rowId) {
      ConfigurationRowActionCreators.clearInputMappingState(
        this.state.componentId,
        this.state.configId,
        this.state.rowId,
        this.props.tableId
      );
    } else {
      InstalledComponentsActionCreators.clearInputMappingState(
        this.state.componentId,
        this.state.configId,
        this.props.tableId
      );
    }
  },

  render() {
    if (!this.state.tableState || !this.state.tableState.get(constants.LAST_IMPORT_DATE_PROPERTY)) {
      return (
        <div className="help-block">
          Table has not been loaded yet.
        </div>
      );
    }

    if (this.state.tableState.get(constants.LAST_IMPORT_DATE_PROPERTY) === this.state.table.get(constants.LAST_IMPORT_DATE_PROPERTY)) {
      return (
        <div className="help-block">
          Table contains no new data.
          {' '}
          <ResetAutomaticLoadTypeButton
            onClick={this.resetState}
            isPending={this.state.resetStatePending}
            disabled={this.state.resetStatePending}
          />
        </div>
      );
    }

    return (
      <div className="help-block">
        Source table updated since the previous update {' '}
        <CreatedDate createdTime={this.state.tableState.get(constants.LAST_IMPORT_DATE_PROPERTY)} />.
        {' '}
        <ResetAutomaticLoadTypeButton
          onClick={this.resetState}
          isPending={this.state.resetStatePending}
          disabled={this.state.resetStatePending}
        />
      </div>
    );
  }
});
