import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Switch from 'rc-switch';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from './Tooltip';

export default createReactClass({
  propTypes: {
    isActive: PropTypes.bool.isRequired,
    isPending: PropTypes.bool.isRequired,
    buttonDisabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    tooltipPlacement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    activateTooltip: PropTypes.string,
    deactivateTooltip: PropTypes.string
  },

  getDefaultProps() {
    return {
      isPending: false,
      buttonDisabled: false,
      tooltipPlacement: 'top',
      activateTooltip: 'Enable',
      deactivateTooltip: 'Disable'
    };
  },

  render() {
    if (this.props.buttonDisabled) {
      return this.renderSwitch();
    }

    return (
      <Tooltip
        placement={this.props.tooltipPlacement}
        tooltip={this.props.isActive ? this.props.deactivateTooltip : this.props.activateTooltip}
      >
        {this.renderSwitch()}
      </Tooltip>
    );
  },

  renderSwitch() {
    return (
      <div className="switch-wrapper" onClick={this.handleOnClick}>
        <Switch
          prefixCls="switch"
          defaultChecked={this.props.isActive}
          checked={this.props.isActive}
          disabled={this.props.buttonDisabled || this.props.isPending}
          onChange={() => this.props.onChange(!this.props.isActive)}
          loadingIcon={this.props.isPending && <Loader className="switch-spinner" />}
        />
      </div>
    );
  },

  handleOnClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }
});
