import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    currentStep: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    help: PropTypes.any
  },

  componentDidMount() {
    this.triggerFocus();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.triggerFocus();
    }
  },

  triggerFocus() {
    this.inputField.focus();
  },

  render() {
    return (
      <FormGroup>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl
          type="text"
          autoFocus={this.props.autoFocus}
          disabled={this.props.disabled}
          value={this.props.value}
          onChange={this.props.onChange}
          inputRef={
            (ref) => {
              this.inputField = ref;
            }
          }
        />
        {this.props.help && (
          <HelpBlock>{this.props.help}</HelpBlock>
        )}
      </FormGroup>
    );
  }
});
