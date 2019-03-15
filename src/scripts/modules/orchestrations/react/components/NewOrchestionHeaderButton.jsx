import React from 'react';

import createReactClass from 'create-react-class';

import NewOrchestrationButton from './NewOrchestionButton';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationsStore)],

  getStateFromStores() {
    return { hasOrchestrations: OrchestrationsStore.getAll().count() };
  },

  render() {
    if (!this.state.hasOrchestrations) {
      return null;
    }

    return <NewOrchestrationButton />;
  }
});
