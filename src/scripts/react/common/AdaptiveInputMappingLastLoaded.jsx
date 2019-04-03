import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable'

import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';

export default createReactClass({
  mixins: [createStoreMixin(RoutesStore, InstalledComponentsStore)],

  propTypes: {
    tableId: PropTypes.string.isRequired
  },

  getStateFromStores() {
    const configuration = InstalledComponentsStore.getConfig(RoutesStore.getComponentId(), RoutesStore.getConfigId());
    return {
      configurationState: Immutable.fromJS(configuration)
    }
  },

  render() {
    return (
      <small>Table loaded on ABCD. Reset.</small>
    );
  }
});
