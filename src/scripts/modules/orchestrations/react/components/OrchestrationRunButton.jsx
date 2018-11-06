import React from 'react';
import RunOrchestrationModal from '../modals/RunOrchestration';
import ActionCreators from '../../ActionCreators';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    tasks: React.PropTypes.object,
    notify: React.PropTypes.bool,
    tooltipPlacement: React.PropTypes.string,
    label: React.PropTypes.string
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

  render() {
    return (
      <RunOrchestrationModal
        orchestration={this.props.orchestration}
        tasks={this.props.tasks}
        notify={this.props.notify}
        onRequestRun={this.handleRunStart}
        onRequestCancel={this.handleRunCancel}
        isLoading={this.state.isLoading}
        tooltipPlacement={this.props.tooltipPlacement}
        onOpen={this.handleOnOpen}
        label={this.props.label}
      />
    );
  },

  handleOnOpen() {
    ActionCreators.startOrchestrationRunTasksEdit(this.props.orchestration.get('id'));
  },

  handleRunCancel() {
    ActionCreators.cancelOrchestrationRunTasksEdit(this.props.orchestration.get('id'));
  },

  handleRunStart() {
    this.setState({
      isLoading: true
    });

    ActionCreators.runOrchestration(
      this.props.orchestration.get('id'),
      this.props.tasks ? this.props.tasks : null,
      this.props.notify
    ).finally(() => {
      if (this.isMounted()) {
        this.setState({
          isLoading: false
        });
      }
    });
  }
});
