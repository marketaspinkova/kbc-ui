import PropTypes from 'prop-types';
import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import immutableMixin from 'react-immutable-render-mixin';

export default function(componentId, storeProvisioning) {
  return React.createClass({
    displayName: 'ExDbQuerNameEdit',
    mixins: [createStoreMixin(storeProvisioning.componentsStore), immutableMixin],

    propTypes: {
      configId: PropTypes.string.isRequired,
      queryId: PropTypes.number.isRequired
    },

    getStateFromStores() {
      const ExDbStore = storeProvisioning.createStore(componentId, this.props.configId);
      const isEditingQuery = ExDbStore.isEditingQuery(this.props.queryId);
      const editingQuery = ExDbStore.getEditingQuery(this.props.queryId);
      const query = (isEditingQuery) ? editingQuery : ExDbStore.getConfigQuery(this.props.queryId);
      return {
        name: (query) ? query.get('name') : null
      };
    },

    render() {
      if (this.state.name) {
        return <span>{this.state.name}</span>;
      } else {
        return <span className="text-muted">Untitled Query</span>;
      }
    }
  });
}
