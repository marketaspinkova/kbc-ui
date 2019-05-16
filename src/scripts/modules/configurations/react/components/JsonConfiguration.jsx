import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { Alert } from 'react-bootstrap';
import Clipboard from '../../../../react/common/Clipboard';
import SaveButtons from '../../../../react/common/SaveButtons';
import Input from './JsonConfigurationInput';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.string,
    isEditingValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    schemaErrors: PropTypes.object,
    showSaveModal: PropTypes.bool,
    saveModalTitle: PropTypes.string,
    saveModalBody: PropTypes.any
  },

  getDefaultProps() {
    return {
      value: '',
      schemaErrors: List()
    };
  },

  render() {
    return (
      <div>
        <h2>
          Configuration{' '}
          <small>
            <Clipboard text={this.props.value} />
          </small>
        </h2>
        {this.renderButtons()}
        {this.renderErrors()}
        <Input
          value={this.props.value}
          disabled={this.props.isSaving}
          onChange={this.props.onEditChange}
        />
      </div>
    );
  },

  renderButtons() {
    return (
      <div className="text-right">
        <SaveButtons
          isSaving={this.props.isSaving}
          disabled={!this.props.isEditingValid || this.props.schemaErrors.count() > 0}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
          showModal={this.props.showSaveModal}
          modalTitle={this.props.saveModalTitle}
          modalBody={this.props.saveModalBody}
        />
      </div>
    );
  },

  renderErrors() {
    if (!this.props.schemaErrors.count()) {
      return null;
    }

    return (
      <Alert bsStyle="danger" style={{ marginTop: '10px' }}>
        <ul>
          {this.props.schemaErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>
    );
  }
});
