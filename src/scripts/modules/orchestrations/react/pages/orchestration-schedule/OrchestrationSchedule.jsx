import React from 'react';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import Schedule from './Schedule';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getStateFromStores() {
    let crontabRecord;
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'schedule');

    if (isEditing) {
      crontabRecord = OrchestrationStore.getEditingValue(orchestrationId, 'schedule');
    } else {
      crontabRecord =  OrchestrationStore.getCrontabRecord() || orchestration.get('crontabRecord') || '0 0 * * *';
    }

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
          />
        </div>
      </div>
    );
  }
});
