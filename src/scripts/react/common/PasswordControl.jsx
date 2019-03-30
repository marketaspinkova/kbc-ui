import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { FormControl, Overlay, Tooltip } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    tooltip: PropTypes.string,
    tooltipPlacement: PropTypes.oneOf(['top', 'left', 'bottom', 'right'])
  },

  target: null,

  getDefaultProps() {
    return {
      disabled: false,
      tooltip: 'Caps Lock is ON',
      tooltipPlacement: 'top'
    };
  },

  getInitialState() {
    return {
      capsLock: false
    };
  },

  render() {
    return (
      <span>
        <Overlay
          show={this.state.capsLock}
          target={this.target}
          placement={this.props.tooltipPlacement}
        >
          <Tooltip id={_.uniqueId('capslock_')}>{this.props.tooltip}</Tooltip>
        </Overlay>
        <FormControl
          type="password"
          ref={(control) => (this.target = control)}
          value={this.props.value}
          onChange={this.props.onChange}
          onKeyPress={this.onKeyPress}
          onBlur={this.onBlur}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
        />
      </span>
    );
  },

  onBlur() {
    if (this.state.capsLock) {
      this.setState({ capsLock: false });
    }
  },

  onKeyPress(event) {
    if (event.getModifierState('CapsLock') !== this.state.capsLock) {
      this.setState({ capsLock: event.getModifierState('CapsLock') });
    }
  }
});
