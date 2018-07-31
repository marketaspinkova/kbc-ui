import React, { PropTypes } from 'react';
import Input from './JsonConfigurationInput';
import Clipboard from '../../../../react/common/Clipboard';
import SaveButtons from '../../../../react/common/SaveButtons';
import immutableMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.string,
    isEditingValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    showSaveModal: PropTypes.bool,
    saveModalTitle: PropTypes.string,
    saveModalBody: PropTypes.any,
    showHeader: PropTypes.bool
  },

  getDefaultProps() {
    return {
      value: '',
      showHeader: true
    };
  },

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderButtons()}
        <Input value={this.props.value} disabled={this.props.isSaving} onChange={this.props.onEditChange} />
      </div>
    );
  },

  renderHeader() {
    if (!this.props.showHeader) {
      return null;
    }
    return (
      <h2>
        Configuration{' '}
        <small>
          <Clipboard text={this.props.value} />
        </small>
      </h2>
    );
  },

  renderButtons() {
    return (
      <div className="text-right">
        <SaveButtons
          isSaving={this.props.isSaving}
          disabled={!this.props.isEditingValid}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
          showModal={this.props.showSaveModal}
          modalTitle={this.props.saveModalTitle}
          modalBody={this.props.saveModalBody}
        />
      </div>
    );
  }
});
