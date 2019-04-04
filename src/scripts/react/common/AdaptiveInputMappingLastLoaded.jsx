import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import { Button } from 'react-bootstrap';

import CreatedDate from './CreatedDate';
import ClearAdaptiveInputMappingModal from './ClearaAdaptiveInputMappingModal';

import { constants } from '../../modules/configurations/utils/configurationState';
import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';

export default createReactClass({
  mixins: [createStoreMixin(RoutesStore, InstalledComponentsStore)],

  propTypes: {
    tableId: PropTypes.string.isRequired
  },

  getStateFromStores() {
    const componentId = RoutesStore.getCurrentRouteComponentId();
    const configId = RoutesStore.getConfigId();
    const rowId = RoutesStore.getRowId();

    let configuration = Immutable.Map();
    if (rowId) {
      configuration = InstalledComponentsStore.getConfigRow(componentId, configId, rowId);
    } else {
      configuration = InstalledComponentsStore.getConfig(componentId, configId);
    }
    return {
      componentId,
      configId,
      rowId,
      // resetPending:
      configurationState: configuration.get('state', Immutable.Map())
    }
  },

  resetState() {

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
          <Button
            bsStyle="link"
          >
            Reset
          </Button>
        </span>
      );
    }
    return (
      <small>Table not yet loaded.</small>
    );
  }
});
