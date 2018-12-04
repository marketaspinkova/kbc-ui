import React from 'react';
import OrchestrationActionCreators from '../../ActionCreators';
import Router from 'react-router';
import Tooltip from '../../../../react/common/Tooltip';
import Confirm from '../../../../react/common/Confirm';
import { Loader } from '@keboola/indigo-ui';
import {Button} from 'react-bootstrap';

const MODE_BUTTON = 'button', MODE_LINK = 'link';

export default React.createClass({
  mixins: [Router.Navigation],

  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string,
    label: React.PropTypes.string,
    mode: React.PropTypes.oneOf([MODE_BUTTON, MODE_LINK])
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top',
      label: '',
      mode: MODE_BUTTON
    };
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
        {this.renderOpenElement()}
      </Confirm>
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
      <Tooltip tooltip="Move to Trash" id="delete" placement={this.props.tooltipPlacement}>
        <Button bsStyle="link">
          <i className="kbc-icon-cup"/> {this.props.label}
        </Button>
      </Tooltip>
    );
  },

  renderOpenLink() {
    return (
      <a>
        <i className="kbc-icon-cup"/> {this.props.label}
      </a>
    );
  },

  _deleteOrchestration() {
    this.transitionTo('orchestrations');
    // if orchestration is deleted immediately view is rendered with missing orchestration because of store changed
    const id = this.props.orchestration.get('id');
    return setTimeout(() => OrchestrationActionCreators.deleteOrchestration(id));
  }
});
