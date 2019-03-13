import PropTypes from 'prop-types';
import React from 'react';
import { Check, Loader } from '@keboola/indigo-ui';
import Tooltip from './Tooltip';

const MODE_BUTTON = 'button',
  MODE_LINK = 'link';

export default React.createClass({
  propTypes: {
    activateTooltip: PropTypes.string,
    deactivateTooltip: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    isPending: PropTypes.bool,
    buttonDisabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    mode: PropTypes.oneOf([MODE_BUTTON, MODE_LINK]),
    tooltipPlacement: PropTypes.string,
    buttonStyle: PropTypes.object
  },

  getDefaultProps() {
    return {
      buttonDisabled: false,
      isPending: false,
      mode: MODE_BUTTON,
      tooltipPlacement: 'top',
      buttonStyle: {},
      activateTooltip: 'Enable',
      deactivateTooltip: 'Disable'
    };
  },

  render() {
    if (this.props.mode === MODE_BUTTON) {
      return this.renderButton();
    } else {
      return this.renderLink();
    }
  },

  tooltip() {
    return this.props.isActive ? this.props.deactivateTooltip : this.props.activateTooltip;
  },

  renderButton() {
    if (this.props.isPending) {
      return (
        <span className="btn btn-link" style={this.props.buttonStyle}>
          <Loader className="fa-fw" />
        </span>
      );
    }

    return (
      <Tooltip placement={this.props.tooltipPlacement} tooltip={this.tooltip()}>
        <button
          disabled={this.props.buttonDisabled || this.props.isPending}
          style={this.props.buttonStyle}
          className="btn btn-link"
          onClick={this.handleClick}
        >
          {this.renderIcon()}
        </button>
      </Tooltip>
    );
  },

  renderLink() {
    return (
      <a onClick={this.handleClick} disabled={this.props.isPending || this.props.buttonDisabled}>
        {this.props.isPending ? <Loader className="fa-fw" /> : this.renderIcon(!this.props.isActive)} {this.tooltip()}
      </a>
    );
  },

  renderIcon() {
    return <Check isChecked={this.props.isActive} />;
  },

  handleClick(e) {
    if (this.props.isPending || this.props.buttonDisabled) {
      return;
    }
    this.props.onChange(!this.props.isActive);
    e.stopPropagation();
    e.preventDefault();
  }
});
