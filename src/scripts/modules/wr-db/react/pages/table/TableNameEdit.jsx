import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { InlineEditInput } from '@keboola/indigo-ui';

import actionCreators from '../../../actionCreators';

export default createReactClass({
  propTypes: {
    tableId: PropTypes.string,
    configId: PropTypes.string,
    componentId: PropTypes.string,
    setEditValueFn: PropTypes.func,
    editingValue: PropTypes.string,
    currentValue: PropTypes.string,
    isSaving: PropTypes.bool,
    tableExportedValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  },

  _handleEditStart() {
    return this.props.setEditValueFn(this.props.currentValue);
  },

  _handleEditSave() {
    const isExported = this.props.tableExportedValue;
    const setFn = actionCreators.setTableToExport;

    return setFn(
      this.props.componentId,
      this.props.configId,
      this.props.tableId,
      this.props.editingValue,
      isExported
    ).then(() => {
      return this.props.setEditValueFn(null);
    });
  },

  _handleEditCancel() {
    return this.props.setEditValueFn(null);
  },

  _handleEditChange(value) {
    return this.props.setEditValueFn(value);
  },

  render() {
    const isEditing = !!this.props.editingValue;
    const { isSaving } = this.props;
    const text = isEditing ? this.props.editingValue : this.props.currentValue;

    return (
      <InlineEditInput
        text={text}
        editTooltip="edit database table name"
        placeholder="Table Name"
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
