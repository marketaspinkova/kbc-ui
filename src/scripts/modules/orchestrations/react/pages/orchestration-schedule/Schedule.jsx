import React from 'react';
import OrchestrationsActionCreators from '../../../ActionCreators';
import CronScheduler from '../../../../../react/common/CronScheduler';
import { Button } from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import RoutesStore from '../../../../../stores/RoutesStore';

export default React.createClass({
  propTypes: {
    orchestrationId: React.PropTypes.number.isRequired,
    crontabRecord: React.PropTypes.string.isRequired,
    defaultCrontabRecord: React.PropTypes.string.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    isEditing: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="kbc-block-with-padding">
        <ConfirmButtons
          isSaving={this.props.isSaving}
          onCancel={this._handleCancel}
          onSave={this._handleSave}
          isDisabled={!this.props.isEditing}
          showCancel={this.props.isEditing}
          className="text-right"
        >
          <Button
            bsStyle="danger"
            onClick={this._handleRemoveSchedule}
            disabled={this.props.isSaving}
          >
            Remove Schedule
          </Button>
        </ConfirmButtons>
        <CronScheduler
          crontabRecord={this.props.crontabRecord}
          defaultCrontabRecord={this.props.defaultCrontabRecord}
          onChange={this._handleCrontabChange}
        />
      </div>
    );
  },

  redirectToDetail() {
    const routerState = RoutesStore.getRouterState();
    const currentPath = routerState.get('path') || '';
    const parts = currentPath.split('/schedule');
    const backPath = parts ? parts[0] : '/';
    RoutesStore.getRouter().transitionTo(backPath || '/');
  },

  _handleRemoveSchedule() {
    this._handleCrontabChange(this.props.defaultCrontabRecord);
    this._handleSave();
    this.redirectToDetail();
  },

  _handleCrontabChange(newSchedule) {
    return OrchestrationsActionCreators.updateOrchestrationScheduleEdit(
      this.props.orchestrationId,
      newSchedule
    );
  },

  _handleSave() {
    return OrchestrationsActionCreators.saveOrchestrationScheduleEdit(this.props.orchestrationId);
  },

  _handleCancel() {
    return OrchestrationsActionCreators.cancelOrchestrationScheduleEdit(this.props.orchestrationId);
  }
});