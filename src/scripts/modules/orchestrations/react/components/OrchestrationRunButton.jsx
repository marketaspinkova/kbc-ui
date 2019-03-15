import PropTypes from 'prop-types';
import React from 'react';
import RunOrchestrationModal from '../modals/RunOrchestration';
import ActionCreators from '../../ActionCreators';

export default React.createClass({
  propTypes: {
    orchestration: PropTypes.object.isRequired,
    tasks: PropTypes.object,
    notify: PropTypes.bool,
    tooltipPlacement: PropTypes.string,
    buttonLabel: PropTypes.string,
    buttonBlock: PropTypes.bool
  },

  getDefaultProps() {
    return {
      notify: false
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
        tasks={this.props.tasks}
        onRequestRun={this.handleRunStart}
        onRequestCancel={this.handleRunCancel}
        isLoading={this.state.isLoading}
        tooltipPlacement={this.props.tooltipPlacement}
        onOpen={this.handleOnOpen}
        buttonLabel={this.props.buttonLabel}
        buttonBlock={this.props.buttonBlock}
        loadTasksFn={this.handleLoadTasks}
      />
    );
  },

  handleLoadTasks() {
    this.setState({
      isLoading: true
    });
    ActionCreators
      .loadOrchestration(this.props.orchestration.get('id'))
      .finally(() => {
        this.setState({
          isLoading: false
        });
      });
  },

  handleOnOpen() {
    ActionCreators.startOrchestrationRunTasksEdit(this.props.orchestration.get('id'));
  },

  handleRunCancel() {
    ActionCreators.cancelOrchestrationRunTasksEdit(this.props.orchestration.get('id'));
  },

  handleRunStart() {
    this.setState({ isLoading: true });

    this.cancellablePromise = ActionCreators.runOrchestration(
      this.props.orchestration.get('id'),
      this.props.tasks ? this.props.tasks : null,
      this.props.notify
    ).finally(() => {
      if (!this.cancellablePromise.isCancelled()) {
        this.setState({ isLoading: false });
      }
    });
  }
});
