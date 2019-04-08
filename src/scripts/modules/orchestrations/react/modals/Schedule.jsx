import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal, Button, Col} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../react/common/CronScheduler';
import OrchestrationsApi from '../../OrchestrationsApi';
import actionCreators from '../../ActionCreators';
import VersionsActionCreators from '../../../components/VersionsActionCreators';
import { ORCHESTRATION_TRIGGER_TYPE } from '../../Constants';
import TriggerSelect from '../components/TriggerSelect';
import EventTrigger from '../components/EventTrigger';

export default createReactClass({
  propTypes: {
    orchestrationId: PropTypes.number.isRequired,
    tables: PropTypes.object.isRequired,
    crontabRecord: PropTypes.string
  },

  getInitialState() {
    return {
      crontabRecord: this.props.crontabRecord || '0 0 * * *',
      isSaving: false,
      showModal: false,
      triggerType: ORCHESTRATION_TRIGGER_TYPE.TIME,
      selectedTables: []
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
      crontabRecord: this.props.crontabRecord || '0 0 * * *'
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
            <TriggerSelect
              selectedValue={this.state.triggerType}
              onSelectValue={this._handleTriggerTypeChange}
              disabled={this.state.isSaving}
            />
            <hr />
            {(this.state.triggerType === ORCHESTRATION_TRIGGER_TYPE.TIME) ?
              <CronScheduler crontabRecord={this.state.crontabRecord} onChange={this._handleCrontabChange} /> :
              <EventTrigger tables={this.props.tables} onChange={this._handleTableSelect} />
            }

          </Modal.Body>
          <Modal.Footer>
            {(this.state.triggerType === ORCHESTRATION_TRIGGER_TYPE.TIME) ?
              this.renderSchedulerButtons() :
              this.renderEventTriggerButtons()
            }
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

  renderSchedulerButtons() {
    return (
      <div>
        <div className="col-sm-6">
          <Button
            className="pull-left"
            bsStyle="danger"
            onClick={this._handleRemoveSchedule}
            disabled={this.state.isSaving}
          >
            Remove Schedule
          </Button>
        </div>
        <div className="col-sm-6">
          <ConfirmButtons
            isSaving={this.state.isSaving}
            isDisabled={false}
            saveLabel="Save"
            onCancel={this.close}
            onSave={this._handleSave}
          />
        </div>
      </div>
    );
  },

  renderEventTriggerButtons() {
    return (
      <Col sm={12}>
        <ConfirmButtons
          className="pull-right"
          isSaving={this.state.isSaving}
          isDisabled={false}
          saveLabel="Save"
          onCancel={this.close}
          onSave={this._handleSave}
        />
      </Col>
    );
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
    VersionsActionCreators.loadVersionsForce('orchestrator', this.props.orchestrationId.toString());
    actionCreators.receiveOrchestration(response);
    this.setState({
      isSaving: false
    });
    return this.close();
  },

  _handleCrontabChange(newValue) {
    return this.setState({
      crontabRecord: newValue
    });
  },

  _handleTriggerTypeChange(value) {
    return this.setState({
      triggerType: value
    });
  },

  _handleTableSelect(state) {
    return this.setState({
      selected: state.selected
    });
  }
});
