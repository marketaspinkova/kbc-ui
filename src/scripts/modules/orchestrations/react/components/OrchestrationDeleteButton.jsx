import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import OrchestrationActionCreators from '../../ActionCreators';
import Router from 'react-router';
import Tooltip from '../../../../react/common/Tooltip';
import Confirm from '../../../../react/common/Confirm';
import { Loader } from '@keboola/indigo-ui';
import classNames from 'classnames';

export default createReactClass({
  mixins: [Router.Navigation],

  propTypes: {
    orchestration: PropTypes.object.isRequired,
    isPending: PropTypes.bool.isRequired,
    tooltipPlacement: PropTypes.string,
    buttonLabel: PropTypes.string,
    buttonBlock: PropTypes.bool
  },

  getDefaultProps() {
    return {
      buttonBlock: false
    };
  },

  render() {
    if (this.props.isPending) {
      return this.renderButton();
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
        {this.renderOpenButton()}
      </Confirm>
    );
  },

  renderOpenButton() {
    if (this.props.tooltipPlacement) {
      return (
        <Tooltip
          tooltip="Move to Trash"
          id="orchestrations-delete-orchestration-confirm"
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
      <span className={classNames('btn btn-link', {
        'btn-block': this.props.buttonBlock
      })}
      >
        {this.props.isPending ? <Loader className="fa-fw" /> : <i className="kbc-icon-cup fa fa-fw"/>}
        {this.props.buttonLabel && (
          <span> {this.props.buttonLabel}</span>
        )}
      </span>
    );
  },

  _deleteOrchestration() {
    this.transitionTo('orchestrations');
    // if orchestration is deleted immediately view is rendered with missing orchestration because of store changed
    const id = this.props.orchestration.get('id');
    return setTimeout(() => OrchestrationActionCreators.deleteOrchestration(id));
  }
});
