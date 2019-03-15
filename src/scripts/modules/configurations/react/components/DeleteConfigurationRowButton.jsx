import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import Tooltip from '../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';

const MODE_BUTTON = 'button', MODE_LINK = 'link';

export default createReactClass({
  propTypes: {
    onClick: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired,
    label: PropTypes.string,
    buttonDisabled: PropTypes.bool,
    mode: PropTypes.oneOf([MODE_BUTTON, MODE_LINK]),
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      buttonDisabled: false,
      mode: MODE_BUTTON,
      tooltipPlacement: 'top',
      label: 'Delete'
    };
  },

  render() {
    if (this.props.mode === MODE_BUTTON) {
      return this.renderButton();
    } else {
      return this.renderLink();
    }
  },

  onClick(e) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onClick();
  },

  renderButton() {
    return (
      <Tooltip placement={this.props.tooltipPlacement} tooltip={this.props.label}>
        <button disabled={this.props.buttonDisabled || this.props.isPending}
          className="btn btn-link" onClick={this.onClick}>
          {this.renderIcon()}
        </button>
      </Tooltip>
    );
  },

  renderIcon() {
    if (this.props.isPending) {
      return (
        <Loader className="fa-fw"/>
      );
    } else {
      return (
        <i className="kbc-icon-cup fa fa-fw"/>
      );
    }
  },

  renderLink() {
    return (
      <a onClick={this.onClick}>
        {this.renderIcon()}
        {' '}
        {this.props.label}
      </a>
    );
  }
});

