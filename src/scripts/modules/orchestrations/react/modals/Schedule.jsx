import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Button } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../react/common/CronScheduler';
import OrchestrationsApi from '../../OrchestrationsApi';
import actionCreators from '../../ActionCreators';
import VersionsActionCreators from '../../../components/VersionsActionCreators';

export default createReactClass({
  propTypes: {
    orchestrationId: PropTypes.number.isRequired,
    crontabRecord: PropTypes.string
  },

  getInitialState() {
    return {
      crontabRecord: this.props.crontabRecord || '0 0 * * *',
      isSaving: false,
      showModal: false
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
            <CronScheduler crontabRecord={this.state.crontabRecord} onChange={this._handleCrontabChange} />
          </Modal.Body>
          <Modal.Footer>
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
          </Modal.Footer>
        </Modal>
      </div>
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
  }
});
