/*
  Edit buttons
  When editing Save and Cancel buttons are shown. These buttons are disabled and loader is shown when saving.
  Edit butotn is shown when editing mode is disabled.
*/
import React from 'react';
import ConfirmButtons from './ConfirmButtons';
import { Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    isEditing: React.PropTypes.bool.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onEditStart: React.PropTypes.func.isRequired,
    isDisabled: React.PropTypes.bool,
    editLabel: React.PropTypes.string,
    cancelLabel: React.PropTypes.string,
    saveLabel: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      editLabel: 'Edit',
      saveLabel: 'Save',
      cancelLabel: 'Cancel',
      isDisabled: false
    };
  },

  render() {
    if (this.props.isEditing) {
      return (
        <ConfirmButtons
          isSaving={this.props.isSaving}
          isDisabled={this.props.isDisabled}
          cancelLabel={this.props.cancelLabel}
          saveLabel={this.props.saveLabel}
          onCancel={this.props.onCancel}
          onSave={this.props.onSave}
          className="pull-right"
        />
      );
    }

    return (
      <span>
        <Button bsStyle="success" onClick={this.props.onEditStart}>
          {this.props.editLabel}
        </Button>
      </span>
    );
  }
});
