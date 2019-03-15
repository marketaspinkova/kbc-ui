import PropTypes from 'prop-types';
import React from 'react';
import RunOrchestrationModal from '../modals/RunOrchestrationTask';

export default React.createClass({
  propTypes: {
    orchestration: PropTypes.object.isRequired,
    task: PropTypes.object.isRequired,
    notify: PropTypes.bool,
    tooltipPlacement: PropTypes.string,
    onRun: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      notify: false,
      tooltipPlacement: 'top'
    };
  },

  getInitialState() {
    return {
      isLoading: false
    };
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  render() {
    return (
      <RunOrchestrationModal
        orchestration={this.props.orchestration}
        task={this.props.task}
        onRequestRun={this.handleRunStart}
        isLoading={this.state.isLoading}
        tooltipPlacement={this.props.tooltipPlacement}
      />
    );
  },

  handleRunStart() {
    this.setState({ isLoading: true });
    this.cancellablePromise = this.props.onRun(this.props.task).finally(() => {
      if (!this.cancellablePromise.isCancelled()) {
        this.setState({ isLoading: false });
      }
    });
  }
});
