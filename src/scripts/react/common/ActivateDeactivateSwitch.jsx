import React from 'react';
import Switch from 'rc-switch';
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
        <Switch
          defaultChecked={this.props.isActive}
          checked={this.props.isActive}
          disabled={this.props.buttonDisabled || this.props.isPending}
          onChange={() => this.props.onChange(!this.props.isActive)}
          onMouseUp={e => {
            e.stopPropagation();
            e.preventDefault();
            console.log(e); // eslint-disable-line
          }}
        />
      </Tooltip>
    );
  }
});
