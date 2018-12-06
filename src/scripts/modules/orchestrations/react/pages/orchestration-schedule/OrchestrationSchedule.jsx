import React from 'react';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import Schedule from './Schedule';

const DEFAULT_CRONTABRECORD = '* * * * *';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'schedule');
    const editingValues = OrchestrationStore.getEditingValue(orchestrationId, 'schedule');
    const crontabRecord = isEditing ?
      editingValues :
      OrchestrationStore.getCrontabRecord() || orchestration.get('crontabRecord') || DEFAULT_CRONTABRECORD;

    return {
      orchestrationId,
      crontabRecord,
      isEditing,
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'schedule')
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <Schedule
            crontabRecord={this.state.crontabRecord}
            orchestrationId={this.state.orchestrationId}
            isSaving={this.state.isSaving}
            isEditing={this.state.isEditing}
            defaultCrontabRecord={DEFAULT_CRONTABRECORD}
          />
        </div>
      </div>
    );
  }
});
