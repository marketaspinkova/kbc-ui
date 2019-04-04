import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';

import CreatedDate from './CreatedDate';

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
    const configuration = InstalledComponentsStore.getConfig(RoutesStore.getCurrentRouteComponentId(), RoutesStore.getConfigId());
    return {
      configurationState: configuration.get('state', Immutable.Map())
    }
  },

  render() {
    const tableState = this.state.configurationState
      .getIn([constants.STORAGE_NAMESPACE, constants.INPUT_NAMESPACE, constants.TABLES_NAMESPACE], Immutable.Map())
      .find((item) => item.get('source') === this.props.tableId);
    if (tableState) {
      return (
        <small>
          Last loaded
          {' '}
          <CreatedDate
            createdTime={tableState.get(constants.LAST_IMPORT_DATE_PROPERTY)}
          />.
        </small>
      );
    }
    return (
      <small>Table not yet loaded.</small>
    );
  }
});
