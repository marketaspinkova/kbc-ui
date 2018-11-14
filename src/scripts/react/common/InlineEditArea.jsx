import React from 'react';
import StaticArea from './InlineEditAreaStatic';
import EditArea from './InlineEditAreaEdit';

export default React.createClass({
  propTypes: {
    onEditStart: React.PropTypes.func.isRequired,
    onEditCancel: React.PropTypes.func.isRequired,
    onEditChange: React.PropTypes.func.isRequired,
    onEditSubmit: React.PropTypes.func.isRequired,
    text: React.PropTypes.string,
    isSaving: React.PropTypes.bool,
    isEditing: React.PropTypes.bool,
    editTooltip: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    collapsible: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      placeholder: 'Click to edit',
      editTooltip: 'Click to edit',
      isSaving: false
    };
  },

  render() {
    if (this.props.isEditing) {
      return (
        <EditArea
          text={this.props.text}
          isSaving={this.props.isSaving}
          placeholder={this.props.placeholder}
          onChange={this.props.onEditChange}
          onCancel={this.props.onEditCancel}
          onSave={this.props.onEditSubmit}
        />
      );
    }

    return (
      <StaticArea
        text={this.props.text}
        editTooltip={this.props.editTooltip}
        placeholder={this.props.placeholder}
        onEditStart={this.props.onEditStart}
        collapsible={this.props.collapsible}
      />
    );
  }
});
