import React from 'react';
import { InlineEditInput } from '@keboola/indigo-ui';

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
    return (
      <InlineEditInput
        onEditStart={this.props.onEditStart}
        onEditCancel={this.props.onEditCancel}
        onEditChange={this.props.onEditChange}
        onEditSubmit={this.props.onEditSubmit}
        text={this.props.text}
        isSaving={this.props.isSaving}
        isEditing={this.props.isEditing}
        isValid={this.props.isValid}
        editTooltip={this.props.editTooltip}
        tooltipPlacement={this.props.tooltipPlacement}
        placeholder={this.props.placeholder}
      />
    );
  }
});
