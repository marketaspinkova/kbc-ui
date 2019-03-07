import React from 'react';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    currentStep: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    autoFocus: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    help: React.PropTypes.any
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
