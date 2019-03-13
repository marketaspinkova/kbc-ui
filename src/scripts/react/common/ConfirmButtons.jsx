/*
   Edit buttons
   When editing Save and Cancel buttons are shown. These buttons are disabled and loader is shown when saving.
   Edit butotn is shown when editing mode is disabled.
 */
import PropTypes from 'prop-types';

import React from 'react';
import classnames from 'classnames';

import { Loader } from '@keboola/indigo-ui';
import { Button, ButtonToolbar } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    isSaving: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool,
    cancelLabel: PropTypes.string,
    saveLabel: PropTypes.string,
    saveStyle: PropTypes.string,
    onCancel: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    saveButtonType: PropTypes.oneOf(['button', 'submit']),
    showCancel: PropTypes.bool,
    showSave: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.any
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save',
      saveStyle: 'success',
      cancelLabel: 'Cancel',
      saveButtonType: 'button',
      isDisabled: false,
      showSave: true,
      showCancel: true
    };
  },

  render() {
    return (
      <ButtonToolbar className={classnames('kbc-buttons', this.props.className)}>
        {this._loader()}
        {this.props.children}
        {!this.props.showCancel && ' '}
        {this._cancelButton()}
        {this._saveButton()}
      </ButtonToolbar>
    );
  },

  _loader() {
    if (this.props.isSaving) return <Loader />;
    return null;
  },

  _saveButton() {
    if (this.props.showSave) {
      return (
        <Button
          type={this.props.saveButtonType}
          bsStyle={this.props.saveStyle}
          disabled={this.props.isSaving || this.props.isDisabled}
          onClick={this.props.onSave}
        >
          {this.props.saveLabel}
        </Button>
      );
    } else return null;
  },

  _cancelButton() {
    if (this.props.showCancel) {
      return (
        <Button bsStyle="link" disabled={this.props.isSaving} onClick={this.props.onCancel}>
          {this.props.cancelLabel}
        </Button>
      );
    } else return null;
  }
});
