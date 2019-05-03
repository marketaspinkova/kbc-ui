import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';
import {Button} from 'react-bootstrap';
import SaveButtonsModal from './SaveButtonsModal';

export default createReactClass({
  propTypes: {
    isSaving: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    saveStyle: PropTypes.string,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    showModal: PropTypes.bool,
    modalTitle: PropTypes.string,
    modalBody: PropTypes.any
  },

  getDefaultProps() {
    return {
      saveStyle: 'success',
      disabled: false,
      showModal: false,
      modalTitle: '',
      modalBody: (<span />)
    };
  },

  getInitialState() {
    return {
      modalOpen: false
    };
  },

  render() {
    return (
      <span className="kbc-buttons kbc-save-buttons">
        {this.resetButton()}
        {this.modal()}
        {this.saveButton()}
      </span>
    );
  },

  saveButtonText() {
    if (this.props.isSaving) {
      return (<Loader />);
    }
    if (this.props.isChanged) {
      return 'Save';
    }
    return 'Saved';
  },

  saveButtonDisabled() {
    if (this.props.disabled) {
      return true;
    }
    if (this.props.isSaving) {
      return true;
    }
    if (this.props.isChanged) {
      return false;
    }
    return true;
  },

  onSaveButtonClick() {
    if (!this.props.showModal) {
      return this.props.onSave();
    } else {
      this.setState({modalOpen: true});
    }
  },

  modal() {
    return (
      <SaveButtonsModal
        title={this.props.modalTitle}
        body={this.props.modalBody}
        show={this.state.modalOpen}
        onSave={this.props.onSave}
        onHide={() => this.setState({modalOpen: false})}
      />
    );
  },

  saveButton() {
    return (
      <Button
        className="save-button"
        bsStyle={this.props.saveStyle}
        disabled={this.saveButtonDisabled()}
        onClick={this.onSaveButtonClick}>
        {this.saveButtonText()}
      </Button>
    );
  },

  resetButton() {
    if (!this.props.isChanged) {
      return null;
    }
    if (this.props.isSaving) {
      return null;
    }
    return (
      <Button
        bsStyle="link"
        onClick={this.props.onReset}>
        Reset
      </Button>
    );
  }
});
