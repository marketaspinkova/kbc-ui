import React from 'react';
import { InlineEditInput } from '@keboola/indigo-ui';

import actionCreators from '../../../actionCreators';

export default React.createClass({
  propTypes: {
    table: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    fieldName: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool.isRequired,
    editTooltip: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return { fieldName: 'title' };
  },

  _handleEditStart() {
    if (!this.props.canEdit) {
      return;
    }
    return actionCreators.startTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      this.props.fieldName
    );
  },

  _handleEditSave() {
    return actionCreators.saveTableField(
      this.props.configurationId,
      this.props.table.get('id'),
      this.props.fieldName,
      this.props.table.getIn(['editingFields', this.props.fieldName], '').trim()
    );
  },

  _handleEditCancel() {
    return actionCreators.cancelTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      this.props.fieldName
    );
  },

  _handleEditChange(column) {
    return actionCreators.updateTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      this.props.fieldName,
      column
    );
  },

  render() {
    let text;
    const isEditing = this.props.table.hasIn(['editingFields', this.props.fieldName]);
    const isSaving = this.props.table.get('savingFields').contains(this.props.fieldName);

    if (isEditing) {
      text = this.props.table.getIn(['editingFields', this.props.fieldName]);
    } else {
      text = this.props.table.getIn(['data', this.props.fieldName]);
    }

    return (
      <InlineEditInput
        text={text}
        editTooltip={this.props.editTooltip}
        placeholder={this.props.placeholder}
        isSaving={isSaving}
        isEditing={isEditing}
        isValid={true}
        onEditStart={this._handleEditStart}
        onEditCancel={this._handleEditCancel}
        onEditChange={this._handleEditChange}
        onEditSubmit={this._handleEditSave}
      />
    );
  }
});
