import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';

import CreatedDate from './CreatedDate';
import ClearAdaptiveInputMappingButton from './ClearAdaptiveInputMappingButton';

import { constants } from '../../modules/configurations/utils/configurationState';
import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';
import ConfigurationRowActionCreators from '../../modules/configurations/ConfigurationRowsActionCreators';
import ConfigurationRowsStore from '../../modules/configurations/ConfigurationRowsStore';
import InstalledComponentsActionCreators from "../../modules/components/InstalledComponentsActionCreators";

export default createReactClass({
  mixins: [createStoreMixin(RoutesStore, InstalledComponentsStore, ConfigurationRowsStore)],

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

    return {
      componentId,
      configId,
      rowId,
      configurationState: configuration.get('state', Immutable.Map()),
      resetStatePending: ConfigurationRowsStore.getPendingActions(componentId, configId, rowId).has('clear-state') || InstalledComponentsStore.getPendingActions(componentId, configId).has('clear-state')
    }
  },

  resetState() {
    if (this.state.rowId) {
      ConfigurationRowActionCreators.clearInputMappingState(this.state.componentId, this.state.configId, this.state.rowId, this.props.tableId);
    } else {
      InstalledComponentsActionCreators.clearInputMappingState(this.state.componentId, this.state.configId, this.props.tableId);
    }
  },

  render() {
    const tableState = this.state.configurationState
      .getIn([constants.STORAGE_NAMESPACE, constants.INPUT_NAMESPACE, constants.TABLES_NAMESPACE], Immutable.Map())
      .find((item) => item.get('source') === this.props.tableId);
    if (tableState) {
      return (
        <span>
          Last updated
          {' '}
          <CreatedDate
            createdTime={tableState.get(constants.LAST_IMPORT_DATE_PROPERTY)}
          />.
          {' '}
          <ClearAdaptiveInputMappingButton
            onClick={this.resetState}
            isPending={this.state.resetStatePending}
            disabled={this.state.resetStatePending}
          />
        </span>
      );
    }
    return (
      <span>No information about previous runs.</span>
    );
  }
});
