import React from 'react';

export default React.createClass({
  propTypes: {
    tasks: React.PropTypes.object.isRequired
  },

  render() {
    if (this.props.tasks.size === 0) {
      return (
        <span>Orchestration has no assigned tasks</span>
      );
    }
    return (
      <span>
        {this.renderCount(this.props.tasks.size, 'task')}
        {' in '}
        {this.renderCount(this.props.tasks.groupBy((task) => (task.get('phase'))).size, 'phase')}
      </span>
    );
  },

  renderCount(count, name) {
    if (count === 1) {
      return (
        <span>{count} {name}</span>
      );
    }
    return (
      <span>{count} {name}s</span>
    );
  }
});
