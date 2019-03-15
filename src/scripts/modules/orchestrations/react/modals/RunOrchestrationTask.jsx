import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import Tooltip from '../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    orchestration: PropTypes.object.isRequired,
    onRequestRun: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    task: PropTypes.object.isRequired,
    tooltipPlacement: PropTypes.string
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Run orchestration task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are about to run single task <strong>{this.props.task.getIn(['config', 'name'])}</strong>
              {' '}from the orchestration <strong>{this.props.orchestration.get('name')}</strong>
              {' '}manually.
            </p>
            <p>
              Notifications will be sent only to you.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              saveLabel="Run"
              onCancel={this.close}
              onSave={this.handleRun}
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
        onClick={this.handleOpen}
        bsStyle="link"
        disabled={this.props.isLoading}
      >
        {this.props.isLoading ? <Loader className="fa-fw" /> : <i className="fa fa-fw fa-play" />}
      </Button>
    );
  },

  handleOpen(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.open();
  },

  handleRun() {
    this.close();
    return this.props.onRequestRun();
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  open() {
    this.setState({
      showModal: true
    });
  }
});
