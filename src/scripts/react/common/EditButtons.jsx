/*
  Edit buttons
  When editing Save and Cancel buttons are shown. These buttons are disabled and loader is shown when saving.
  Edit butotn is shown when editing mode is disabled.
*/
import PropTypes from 'prop-types';

import React from 'react';
import ConfirmButtons from './ConfirmButtons';
import { Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onEditStart: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    editLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    saveLabel: PropTypes.string
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
