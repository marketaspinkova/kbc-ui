import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TaskSelectTable from '../components/TaskSelectTable';
import { Loader, PanelWithDetails } from '@keboola/indigo-ui';
import OrchestrationActionCreators from '../../ActionCreators';

const MODE_BUTTON = 'button', MODE_LINK = 'link';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    tasks: React.PropTypes.object,
    onRequestRun: React.PropTypes.func.isRequired,
    onRequestCancel: React.PropTypes.func,
    isLoading: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string,
    onOpen: React.PropTypes.func,
    label: React.PropTypes.string,
    mode: React.PropTypes.oneOf([MODE_BUTTON, MODE_LINK])
  },

  getInitialState() {
    return { showModal: false };
  },

  getDefaultProps() {
    return {
      label: '',
      mode: MODE_BUTTON
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
    return this.setState({
      showModal: true
    });
  },

  render() {
    return (
      <span>
        {this.renderOpenElement()}
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

  renderOpenElement() {
    if (this.props.mode === MODE_BUTTON) {
      return this.renderOpenButton();
    } else {
      return this.renderOpenLink();
    }
  },

  renderOpenButton() {
    return (
      <Tooltip tooltip="Run" id="run" placement={this.props.tooltipPlacement}>
        <Button onClick={this._handleOpenClick} bsStyle="link">
          {this.props.isLoading ? (
            <Loader className="fa-fw" />
          ) : (
            <span><i className="fa fa-fw fa-play" /> <span>{this.props.label}</span></span>
          )}
        </Button>
      </Tooltip>
    );
  },

  renderOpenLink() {
    return (
      <a onClick={this._handleOpenClick} disabled={this.props.isLoading}>
        {this.props.isLoading ? <span><Loader className="fa-fw"/> {this.props.label}</span> :
          <span><i className="fa fa-fw fa-play"/> {this.props.label}</span>}
      </a>
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
