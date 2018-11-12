import React from 'react';
import Switch from 'rc-switch';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from './Tooltip';

export default React.createClass({
  propTypes: {
    isActive: React.PropTypes.bool.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    buttonDisabled: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired,
    activateTooltip: React.PropTypes.string,
    deactivateTooltip: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      isPending: false,
      buttonDisabled: false,
      activateTooltip: 'Enable',
      deactivateTooltip: 'Disable'
    };
  },

  render() {
    const tooltip = this.props.isActive ? this.props.deactivateTooltip : this.props.activateTooltip;

    return (
      <Tooltip placement="top" tooltip={tooltip}>
        <div className="rc-switch-wrapper" onClick={this.handleOnClick}>
          <Switch
            defaultChecked={this.props.isActive}
            checked={this.props.isActive}
            disabled={this.props.buttonDisabled || this.props.isPending}
            onChange={() => this.props.onChange(!this.props.isActive)}
            loadingIcon={this.props.isPending && <Loader />}
          />
        </div>
      </Tooltip>
    );
  },

  handleOnClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }
});
