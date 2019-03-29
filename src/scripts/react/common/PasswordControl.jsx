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
    tooltipPosition: PropTypes.oneOf(['top', 'left', 'bottom', 'right'])
  },

  target: null,

  getDefaultProps() {
    return {
      disabled: false,
      tooltip: 'Caps Lock is ON'
    };
  },

  getInitialState() {
    return {
      capsLock: false
    };
  },

  render() {
    return (
      <span onKeyPress={this.onKeyPress} onBlur={this.onBlur}>
        <Overlay show={this.state.capsLock} target={this.target} container={this} placement="top">
          <Tooltip id={_.uniqueId('capslock_')}>{this.props.tooltip}</Tooltip>
        </Overlay>
        <FormControl
          type="password"
          ref={(control) => (this.target = control)}
          value={this.props.value}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
        />
      </span>
    );
  },

  onBlur() {
    this.setState({ capsLock: false });
  },

  onKeyPress(event) {
    this.setState({ capsLock: event.getModifierState('CapsLock') });
  }
});
