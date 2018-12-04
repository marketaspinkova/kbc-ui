import React from 'react';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import {Button} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../../react/common/CronScheduler';
import OrchestrationsActionCreators from '../../../ActionCreators';

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
          <div className="kbc-block-with-padding">
            <p>
              <ConfirmButtons
                isSaving={this.state.isSaving}
                onCancel={this._handleCancel}
                onSave={this._handleSave}
                isDisabled={!this.state.isEditing}
                className="text-right"
              >
                <Button
                  bsStyle="danger"
                  onClick={this._handleRemoveSchedule}
                  disabled={this.state.isSaving}
                >
                  Remove Schedule
                </Button>
              </ConfirmButtons>
            </p>
            <CronScheduler crontabRecord={this.state.crontabRecord} onChange={this._handleCrontabChange}/>
          </div>
        </div>
      </div>
    );
  },

  componentWillMount() {
    return OrchestrationsActionCreators.startOrchestrationScheduleEdit(this.state.orchestrationId);
  },

  _handleCrontabChange(newSchedule) {
    return OrchestrationsActionCreators.updateOrchestrationScheduleEdit(
      this.state.orchestrationId,
      newSchedule
    );
  },

  _handleSave() {
    return OrchestrationsActionCreators.saveOrchestrationScheduleEdit(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationScheduleEdit(this.state.orchestrationId);
  }
});
