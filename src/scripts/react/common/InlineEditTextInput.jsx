import React from 'react';
import StaticInput from './InlineEditTextStatic';
import EditInput from './InlineEditTextEdit';

export default React.createClass({
  propTypes: {
    onEditStart: React.PropTypes.func.isRequired,
    onEditCancel: React.PropTypes.func.isRequired,
    onEditChange: React.PropTypes.func.isRequired,
    onEditSubmit: React.PropTypes.func.isRequired,
    text: React.PropTypes.string,
    isSaving: React.PropTypes.bool,
    isEditing: React.PropTypes.bool,
    isValid: React.PropTypes.bool,
    editTooltip: React.PropTypes.string,
    tooltipPlacement: React.PropTypes.string,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      placeholder: 'Click to edit',
      editTooltip: 'Click to edit',
      tooltipPlacement: 'top',
      isSaving: false
    };
  },

  render() {
    if (this.props.isEditing) {
      return (
        <EditInput
          text={this.props.text}
          isSaving={this.props.isSaving}
          isValid={this.props.isValid}
          placeholder={this.props.placeholder}
          onChange={this.props.onEditChange}
          onCancel={this.props.onEditCancel}
          onSave={this.props.onEditSubmit}
        />
      );
    }

    return (
      <StaticInput
        text={this.props.text}
        editTooltip={this.props.editTooltip}
        tooltipPlacement={this.props.tooltipPlacement}
        placeholder={this.props.placeholder}
        onClick={this.props.onEditStart}
      />
    );
  }
});
