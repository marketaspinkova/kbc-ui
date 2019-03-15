import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({

  getInitialState() {
    return {isExpanded: false};
  },

  render() {
    if (this.state.isExpanded) {
      return (
        <div>
          {this.renderInfo()}
          <button
            onClick={ () => this.setState({isExpanded: false})}
            className="btn btn-sm btn-link">
            Hide
          </button>
        </div>
      );
    } else {
      return (
        <span>
          <button
            onClick={ () => this.setState({isExpanded: true})}
            className="btn btn-sm btn-link">
            More about phases
          </button>
        </span>

      );
    }
  },

  renderInfo() {
    return (
      <span>
Phases are executed sequentially from top to bottom. All tasks belonging to a phase are run in parallel. The next phase will begin right after all tasks from the previous phase are finished. For example, a common setup could have 3 phases: Extract, Transform and Load.
      </span>
    );
  }

});
