import React from 'react';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import {Button} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../../react/common/CronScheduler';
import OrchestrationsActionCreators from '../../../ActionCreators';

/* eslint no-console: 0 */

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],

  getStateFromStores() {
    let schedule;
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const isEditing = OrchestrationStore.isEditing(orchestrationId, 'schedule');

    if (isEditing) {
      schedule = OrchestrationStore.getEditingValue(orchestrationId, 'schedule');
    } else {
      schedule = orchestration.get('crontabRecord') || '0 0 * * *';
    }

    return {
      orchestrationId,
      schedule,
      isSaving: OrchestrationStore.isSaving(orchestrationId, 'schedule'),
      isEditing: OrchestrationStore.isEditing(orchestrationId, 'schedule')
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
            <CronScheduler crontabRecord={this.state.schedule} onChange={this._handleCrontabChange}/>
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
    console.log('nuval 1');
    return OrchestrationsActionCreators.saveOrchestrationScheduleEdit(this.state.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationScheduleEdit(this.state.orchestrationId);
  }
});
