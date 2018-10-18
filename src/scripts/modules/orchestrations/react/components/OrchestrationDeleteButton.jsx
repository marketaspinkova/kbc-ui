import React from 'react';
import OrchestrationActionCreators from '../../ActionCreators';
import Router from 'react-router';
import Tooltip from '../../../../react/common/Tooltip';
import Confirm from '../../../../react/common/Confirm';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [Router.Navigation],

  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string
  },

  getDefaultProps() {
    return { tooltipPlacement: 'top' };
  },

  render() {
    if (this.props.isPending) {
      return (
        <span className="btn btn-link">
          <Loader />
        </span>
      );
    }

    return (
      <Confirm
        title="Move Configuration to Trash"
        text={[
          <p key="question">
            {`Are you sure you want to move the configuration ${this.props.orchestration.get('name')} to Trash?`}
          </p>,
          <p key="warning">
            <i className="fa fa-exclamation-triangle" />
            {" This configuration can't be restored."}
          </p>
        ]}
        buttonLabel="Move to Trash"
        onConfirm={this._deleteOrchestration}
      >
        <Tooltip tooltip="Move to Trash" id="delete" placement={this.props.tooltipPlacement}>
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  },

  _deleteOrchestration() {
    this.transitionTo('orchestrations');
    // if orchestration is deleted immediately view is rendered with missing orchestration because of store changed
    const id = this.props.orchestration.get('id');
    return setTimeout(() => OrchestrationActionCreators.deleteOrchestration(id));
  }
});
