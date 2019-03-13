import PropTypes from 'prop-types';
import React from 'react';
import StaticArea from './InlineEditAreaStatic';
import EditArea from './InlineEditAreaEdit';

export default React.createClass({
  propTypes: {
    onEditStart: PropTypes.func.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    text: PropTypes.string,
    isSaving: PropTypes.bool,
    isEditing: PropTypes.bool,
    editTooltip: PropTypes.string,
    placeholder: PropTypes.string,
    collapsible: PropTypes.bool
  },

  getDefaultProps() {
    return {
      placeholder: 'Click to edit',
      editTooltip: 'Click to edit',
      isSaving: false,
      collapsible: true
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
