/*
  Delete button with confirm and loading state
*/

import React from 'react';
import classnames from 'classnames';
import Tooltip from './Tooltip';
import { Loader } from '@keboola/indigo-ui';
import Confirm from './Confirm';

export default React.createClass({
  propTypes: {
    tooltip: React.PropTypes.string,
    confirm: React.PropTypes.object, // Confirm props
    isPending: React.PropTypes.bool,
    isEnabled: React.PropTypes.bool,
    label: React.PropTypes.string,
    fixedWidth: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      tooltip: 'Restore',
      isPending: false,
      isEnabled: true,
      label: '',
      fixedWidth: false
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

    if (!this.props.isEnabled) {
      return (
        <span className="btn btn-link disabled">
          <em className="fa-reply" />
        </span>
      );
    }

    return (
      <Confirm buttonLabel="Restore" {...this.props.confirm}>
        <Tooltip tooltip={this.props.tooltip} id="delete" placement="top">
          <button className="btn btn-link">
            <i className={classnames('fa', 'fa-reply', { 'fa-fw': this.props.fixedWidth })} />
            {this.props.label && ` ${this.props.label}`}
          </button>
        </Tooltip>
      </Confirm>
    );
  }
});
