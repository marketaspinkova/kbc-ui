import React from 'react';
import RunOrchestrationModal from '../modals/RunOrchestration';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    task: React.PropTypes.object.isRequired,
    notify: React.PropTypes.bool,
    tooltipPlacement: React.PropTypes.string,
    onRun: React.PropTypes.func.isRequired
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
        task={this.props.task}
        notify={this.props.notify}
        onRequestRun={this.handleRunStart}
        isLoading={this.state.isLoading}
        tooltipPlacement={this.props.tooltipPlacement}
      />
    );
  },

  handleRunStart() {
    this.setState({
      isLoading: true
    });

    return this.props.onRun(this.props.task).finally(() => {
      if (this.isMounted()) {
        this.setState({
          isLoading: false
        });
      }
    });
  }
});
