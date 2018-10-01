import React from 'react';
import TaskSelectTable from '../components/TaskSelectTable';
import { Modal, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRun: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    isSaving: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return { showModal: false };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    this.props.onOpen();
    return this.setState({
      showModal: true
    });
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} bsSize="large" keyboard={false} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Retry job</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are about to run orchestration again
              <TaskSelectTable tasks={this.props.tasks} onTaskUpdate={this._handleTaskUpdate} />
            </p>
          </Modal.Body>
          <Modal.Footer>
            <div>
              <div className="col-sm-6" />
              <div className="col-sm-6">
                <ConfirmButtons
                  isSaving={false}
                  isDisabled={!this._isValid()}
                  saveLabel="Run"
                  onCancel={this.close}
                  onSave={this._handleRun}
                />
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  renderOpenButton() {
    return (
      <Button onClick={this.open} bsStyle="link">
        {this.props.isSaving ? <Loader /> : <i className="fa fa-play" />}
        {' Job retry'}
      </Button>
    );
  },

  _handleRun() {
    this.props.onRun();
    return this.close();
  },

  _handleTaskUpdate(updatedTask) {
    return this.props.onChange(updatedTask);
  },

  _isValid() {
    return (
      this.props.tasks
        .filter(
          tasks =>
            tasks
              .get('tasks')
              .filter(task => task.get('active'))
              .count() > 0
        )
        .count() > 0
    );
  }
});
