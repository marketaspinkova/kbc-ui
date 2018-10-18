import React from 'react';

import NewOrchestrationButton from './NewOrchestionButton';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';

export default React.createClass({
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
