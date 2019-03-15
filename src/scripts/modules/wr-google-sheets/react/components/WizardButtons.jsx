import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';
import {Button} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    isSaving: PropTypes.bool.isRequired,
    isNextDisabled: PropTypes.bool,
    isPreviousDisabled: PropTypes.bool,
    isSaveDisabled: PropTypes.bool,
    cancelLabel: PropTypes.string,
    saveLabel: PropTypes.string,
    nextLabel: PropTypes.string,
    previousLabel: PropTypes.string,
    saveStyle: PropTypes.string,
    nextStyle: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    showSave: PropTypes.bool,
    showNext: PropTypes.bool,
    savingMessage: PropTypes.string
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save Sheet',
      nextLabel: 'Next',
      previousLabel: 'Previous',
      cancelLabel: 'Cancel',
      saveStyle: 'success',
      nextStyle: 'primary',
      isSaveDisabled: false,
      isNextDisabled: false,
      isPreviousDisabled: true,
      showSave: false,
      showNext: true,
      savingMessage: ''
    };
  },

  render() {
    return (
      <div className="kbc-buttons">
        {this.renderLoader()}
        {this.renderCancelButton()}
        {this.renderPreviousButton()}
        {this.renderNextButton()}
        {this.renderSaveButton()}
      </div>
    );
  },

  renderLoader() {
    if (this.props.isSaving) {
      return (
        <span className="text-muted">
          {this.props.savingMessage}
          &nbsp;&nbsp;
          <Loader />
        </span>
      );
    }
    return null;
  },

  renderPreviousButton() {
    return (
      <Button
        bsStyle="default"
        disabled={this.props.isSaving || this.props.isPreviousDisabled}
        onClick={this.props.onPrevious}>
        {this.props.previousLabel}
      </Button>
    );
  },

  renderNextButton() {
    if (this.props.showNext) {
      return (
        <Button
          bsStyle={this.props.nextStyle}
          disabled={this.props.isSaving || this.props.isNextDisabled}
          onClick={this.props.onNext}>
          {this.props.nextLabel}
        </Button>
      );
    }
    return null;
  },

  renderSaveButton() {
    if (this.props.showSave) {
      return (
        <Button
          bsStyle={this.props.saveStyle}
          disabled={this.props.isSaving || this.props.isSaveDisabled}
          onClick={this.props.onSave}>
          {this.props.saveLabel}
        </Button>
      );
    }
    return null;
  },

  renderCancelButton() {
    return (
      <Button
        bsStyle="link"
        disabled={this.props.isSaving}
        onClick={this.props.onCancel}>
        {this.props.cancelLabel}
      </Button>
    );
  }
});
