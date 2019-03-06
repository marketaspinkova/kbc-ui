import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default function(componentId, storeProvisioning) {
  return React.createClass({
    displayName: 'ExDbQuerNameEdit',
    mixins: [createStoreMixin(storeProvisioning.componentsStore), PureRenderMixin],

    propTypes: {
      configId: React.PropTypes.string.isRequired,
      queryId: React.PropTypes.number.isRequired
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
