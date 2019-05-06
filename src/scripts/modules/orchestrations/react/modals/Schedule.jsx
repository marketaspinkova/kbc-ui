import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal, Button, Col} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../react/common/CronScheduler';
import OrchestrationsApi from '../../OrchestrationsApi';
import actionCreators from '../../ActionCreators';
import VersionsActionCreators from '../../../components/VersionsActionCreators';
import { ORCHESTRATION_INVOKE_TYPE } from '../../Constants';
import InvokeSelect from '../components/InvokeSelect';
import EventTrigger from '../components/EventTrigger';
import {fromJS} from 'immutable';
import StorageApi from '../../../components/StorageApi';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { FEATURE_EVENT_ORCHESTRATIONS } from '../../../../constants/KbcConstants';

const componentId = 'orchestrator';

export default createReactClass({
  propTypes: {
    orchestrationId: PropTypes.number.isRequired,
    tables: PropTypes.object.isRequired,
    crontabRecord: PropTypes.string,
    trigger: PropTypes.object
  },

  getInitialState() {
    return {
      crontabRecord: this.props.crontabRecord || '0 0 * * *',
      isSaving: false,
      showModal: false,
      invokeType: this.props.trigger ? ORCHESTRATION_INVOKE_TYPE.EVENT : ORCHESTRATION_INVOKE_TYPE.TIME,
      trigger: this.props.trigger || { tables: [], coolDownPeriodMinutes: '5' }
    };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open(e) {
    e.preventDefault();
    return this.setState({
      showModal: true,
      crontabRecord: this.props.crontabRecord || '0 0 * * *',
      invokeType: this.props.trigger ? ORCHESTRATION_INVOKE_TYPE.EVENT : ORCHESTRATION_INVOKE_TYPE.TIME,
      trigger: this.props.trigger || { tables: [], coolDownPeriodMinutes: '5' }
    });
  },

  render() {
    return (
      <div>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close} keyboard={false}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Orchestration Schedule</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {ApplicationStore.hasCurrentProjectFeature(FEATURE_EVENT_ORCHESTRATIONS) && (
              <InvokeSelect
                selectedValue={this.state.invokeType}
                onSelectValue={this._handleInvokeTypeChange}
                disabled={this.state.isSaving}
              />
            )}
            {(this.state.invokeType === ORCHESTRATION_INVOKE_TYPE.TIME) ?
              <CronScheduler crontabRecord={this.state.crontabRecord} onChange={this._handleCrontabChange} /> :
              <EventTrigger
                tables={this.props.tables}
                selected={this.state.trigger.tables.map(item => Object.values(item)).flat()}
                period={this.state.trigger.coolDownPeriodMinutes}
                onAddTable={this._handleTriggerTableAdd}
                onRemoveTable={this._handleTriggerTableRemove}
                onChangePeriod={this._handleTriggerPeriodChange}
              />
            }

          </Modal.Body>
          <Modal.Footer>
            {(this.state.invokeType === ORCHESTRATION_INVOKE_TYPE.TIME) ?
              this.renderSchedulerButtons() :
              this.renderEventTriggerButtons()
            }
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

  renderSchedulerButtons() {
    return [
      <Col key={1} sm={6}>
        <Button
          className="pull-left"
          bsStyle="danger"
          onClick={this._handleRemoveSchedule}
          disabled={this.state.isSaving || !this.props.crontabRecord}
        >
          Remove Schedule
        </Button>
      </Col>,
      <Col key={2} sm={6}>
        <ConfirmButtons
          isSaving={this.state.isSaving}
          isDisabled={false}
          saveLabel="Save"
          onCancel={this.close}
          onSave={this._handleSave}
        />
      </Col>
    ];
  },

  renderEventTriggerButtons() {
    return [
      <Col key={1} sm={6}>
        <Button
          className="pull-left"
          bsStyle="danger"
          onClick={this._handleRemoveTrigger}
          disabled={this.state.isSaving || !this.state.trigger.id}
        >
          Remove Trigger
        </Button>
      </Col>,
      <Col key={2} sm={6}>
        <ConfirmButtons
          className="pull-right"
          isSaving={this.state.isSaving}
          isDisabled={!this.state.trigger.tables.length}
          saveLabel="Save"
          onCancel={this.close}
          onSave={this._handleTriggerSave}
        />
      </Col>
    ];
  },

  renderOpenButton() {
    return (
      <Button bsStyle="primary" className="pull-right" onClick={this.open}>
        <i className="fa fa-edit" /> Edit Schedule
      </Button>
    );
  },

  _handleRemoveSchedule() {
    return this._save(null);
  },

  _handleSave() {
    if (this.state.trigger.id) {
      return actionCreators.deleteTrigger(this.state.trigger.id)
        .then(() => this._save(this.state.crontabRecord));
    }
    return this._save(this.state.crontabRecord);
  },

  _save(crontabRecord) {
    this.setState({
      isSaving: true
    });

    return OrchestrationsApi.updateOrchestration(this.props.orchestrationId, { crontabRecord }).then(
      this._handleSaveSuccess
    );
  },

  _handleSaveSuccess(response) {
    return VersionsActionCreators.loadVersionsForce(componentId, this.props.orchestrationId.toString())
      .then(() => actionCreators.receiveOrchestration(response))
      .then(() => {
        this.setState({ isSaving: false });
        return this.close();
      });
  },

  _handleCrontabChange(newValue) {
    return this.setState({
      crontabRecord: newValue
    });
  },

  _handleInvokeTypeChange(value) {
    return this.setState({
      invokeType: value
    });
  },

  _handleTriggerTableAdd(tableId) {
    let trigger = fromJS(this.state.trigger);

    return this.setState({
      trigger: trigger.set('tables', trigger.get('tables').push({ tableId })).toJS()
    });
  },

  _handleTriggerTableRemove(tableId) {
    let trigger = fromJS(this.state.trigger);
    const tables = trigger.get('tables').filter(item => item.get('tableId') !== tableId);

    return this.setState({
      trigger: trigger.set('tables', tables).toJS()
    });
  },

  _handleTriggerPeriodChange(event) {
    let trigger = fromJS(this.state.trigger);
    const value = event.target.value.toString();
    return this.setState({
      trigger: trigger.set('coolDownPeriodMinutes', value).toJS()
    });
  },

  _handleTriggerSave() {
    this.setState({ isSaving: true });
    return this._saveTrigger(this.state.trigger.tables, this.state.trigger.coolDownPeriodMinutes)
      .then(() => this._save(null));
  },

  _saveTrigger(tableIds, period) {
    if (this.state.trigger.id) {
      return actionCreators.updateTrigger(this.state.trigger.id, {
        coolDownPeriodMinutes: period,
        tableIds: tableIds.map(item => item.tableId)
      });
    }
    return this._createTriggerToken()
      .then(token => actionCreators.createTrigger({
        runWithTokenId: token.id,
        component: componentId,
        configurationId: this.props.orchestrationId,
        coolDownPeriodMinutes: period,
        tableIds: tableIds.map(item => item.tableId)
      }));
  },

  _createTriggerToken() {
    const tokenParams = {
      canManageBuckets: false,
      canReadAllFileUploads: false,
      componentAccess: [componentId],
      description: `Token for triggering an orchestrator`,
      expiresIn: null
    };

    return StorageApi.createToken(tokenParams);
  },

  _handleRemoveTrigger() {
    this.setState({ isSaving: true });
    return actionCreators.deleteTrigger(this.state.trigger.id)
      .then(() => {
        this.setState({ isSaving: false });
        return this.close();
      });
  }
});
