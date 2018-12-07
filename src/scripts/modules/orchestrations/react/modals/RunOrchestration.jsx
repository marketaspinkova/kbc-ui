import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TaskSelectTable from '../components/TaskSelectTable';
import { Loader, PanelWithDetails } from '@keboola/indigo-ui';
import OrchestrationActionCreators from '../../ActionCreators';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    tasks: React.PropTypes.object,
    onRequestRun: React.PropTypes.func.isRequired,
    onRequestCancel: React.PropTypes.func,
    isLoading: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string,
    onOpen: React.PropTypes.func,
    buttonLabel: React.PropTypes.string,
    buttonBlock: React.PropTypes.bool,
    loadTasksFn: React.PropTypes.func.isRequired
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
    if (!this.props.tasks) {
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
            <div>
              {'You are about to run the orchestration '}
              <strong>
                {this.props.orchestration.get('name')}
                {' manually and the notifications will be sent only to you.'}
              </strong>
              {this.props.tasks && (
                <PanelWithDetails placement="top" labelCollapse="Hide Tasks" labelOpen="Show Tasks">
                  <TaskSelectTable tasks={this.props.tasks} onTaskUpdate={this._handleTaskUpdate} />
                </PanelWithDetails>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isDisabled={!this._isValid()}
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
      >
        {this.props.isLoading ? <Loader className="fa-fw" /> : <i className="fa fa-fw fa-play" />}
        {this.props.buttonLabel && (
          <span> {this.props.buttonLabel}</span>
        )}
      </Button>
    );
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
