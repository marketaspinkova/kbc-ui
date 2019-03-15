import PropTypes from 'prop-types';
import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import { COMPONENT_ID } from '../../constants';

export default function(storeProvisioning) {
  return React.createClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    propTypes: {
      configId: PropTypes.string.isRequired,
      queryId: PropTypes.number.isRequired
    },

    getStateFromStores() {
      const { configId, queryId } = this.props;
      const ExDbStore = storeProvisioning.createStore(COMPONENT_ID, configId);
      const isEditingQuery = ExDbStore.isEditingQuery(queryId);
      const editingQuery = ExDbStore.getEditingQuery(queryId);
      const query = (isEditingQuery) ? editingQuery : ExDbStore.getConfigQuery(queryId);
      return {
        name: query ? query.get('name') : null
      };
    },

    render() {
      return this.state.name ? <span>{this.state.name}</span> : <span className="text-muted">Untitled Export</span>;
    }
  });
}
