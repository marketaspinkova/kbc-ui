import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { Modal, Button, Alert } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TaskSelectTable from '../components/TaskSelectTable';
import { Loader, PanelWithDetails } from '@keboola/indigo-ui';
import OrchestrationActionCreators from '../../ActionCreators';

export default React.createClass({
  propTypes: {
    orchestration: PropTypes.object.isRequired,
    onRequestRun: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    tasks: PropTypes.object,
    onRequestCancel: PropTypes.func,
    tooltipPlacement: PropTypes.string,
    onOpen: PropTypes.func,
    buttonLabel: PropTypes.string,
    buttonBlock: PropTypes.bool,
    loadTasksFn: PropTypes.func
  },

  getInitialState() {
    return { showModal: false };
  },

  getDefaultProps() {
    return {
      buttonBlock: false
    };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    if (this.props.onOpen) {
      this.props.onOpen();
    }
    if (!this.props.tasks && this.props.loadTasksFn) {
      this.props.loadTasksFn();
    }
    return this.setState({
      showModal: true
    });
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} bsSize="large" onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>{`Run orchestration ${this.props.orchestration.get('name')}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderTasksTable()}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isDisabled={!this._isValid() || this.props.isLoading}
              isSaving={false}
              saveLabel="Run"
              onCancel={this._handleCancel}
              onSave={this._handleRun}
            />
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  renderTasksTable() {
    if (!this.state.showModal) {
      return null;
    }

    if (this.props.isLoading && !this.hasTasks()) {
      return (
        <p>
          <Loader /> Loading tasks...
        </p>
      );
    }

    if (!this.hasTasks()) {
      return (
        <Alert bsStyle="warning">
          Orchestration cannot be run without tasks. Please{' '}
          <Link
            to="orchestrationTasks"
            params={{
              orchestrationId: this.props.orchestration.get('id')
            }}
          >
            add tasks
          </Link>
          {' '}and run orchestration again.
        </Alert>
      );
    }

    return (
      <div>
        <p>
          {'You are about to run the orchestration '}
          <strong>
            {this.props.orchestration.get('name')}
            {' manually and the notifications will be sent only to you.'}
          </strong>
        </p>
        {this.props.tasks && (
          <PanelWithDetails placement="top" labelCollapse="Hide Tasks" labelOpen="Show Tasks">
            <TaskSelectTable
              tasks={this.props.tasks}
              onTaskUpdate={this._handleTaskUpdate}
              onTasksUpdate={this._handleTasksUpdate}
            />
          </PanelWithDetails>
        )}
      </div>
    );
  },

  renderOpenButton() {
    if (this.props.tooltipPlacement) {
      return (
        <Tooltip
          tooltip="Run orchestration"
          id="orchestrations-modals-run-orchestration"
          placement={this.props.tooltipPlacement}
        >
          {this.renderButton()}
        </Tooltip>
      );
    }
    return this.renderButton();
  },

  renderButton() {
    return (
      <Button
        onClick={this._handleOpenClick}
        bsStyle="link"
        block={this.props.buttonBlock}
        disabled={this.props.isLoading}
      >
        {this.props.isLoading ? <Loader className="fa-fw" /> : <i className="fa fa-fw fa-play" />}
        {this.props.buttonLabel && <span> {this.props.buttonLabel}</span>}
      </Button>
    );
  },

  hasTasks() {
    return this.props.tasks && this.props.tasks.count() > 0;
  },

  _handleOpenClick(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.open();
  },

  _handleRun() {
    this.close();
    return this.props.onRequestRun();
  },

  _handleCancel() {
    if (this.props.onRequestCancel) {
      this.close();
      return this.props.onRequestCancel();
    } else {
      return this.close();
    }
  },

  _handleTasksUpdate(updatedTasks) {
    return OrchestrationActionCreators.updateOrchestrationRunTasksEdit(
      this.props.orchestration.get('id'),
      updatedTasks
    );
  },

  _handleTaskUpdate(updatedTask) {
    let tasks = this.props.tasks.map(phase => {
      const newTasks = phase.get('tasks').map(t => {
        if (t.get('id') === updatedTask.get('id')) {
          return updatedTask;
        } else {
          return t;
        }
      });
      return phase.set('tasks', newTasks);
    });

    return OrchestrationActionCreators.updateOrchestrationRunTasksEdit(this.props.orchestration.get('id'), tasks);
  },

  _isValid() {
    if (!this.props.tasks) {
      return true;
    }

    const allTasks = this.props.tasks;

    if (allTasks) {
      return (
        allTasks
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
  }
});
