import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore), immutableMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    editElement: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    fallbackValue: PropTypes.string,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return { tooltipPlacement: 'top' };
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getState(nextProps));
  },

  getStateFromStores() {
    return this.getState(this.props);
  },

  getState(props) {
    let value = InstalledComponentsStore.getConfigRow(props.componentId, props.configId, props.rowId).get(
      props.fieldName
    );
    if (value === '' && props.fallbackValue) {
      value = props.fallbackValue;
    }
    return {
      value,
      editValue: InstalledComponentsStore.getEditingConfigRow(
        props.componentId,
        props.configId,
        props.rowId,
        props.fieldName
      ),
      isEditing: InstalledComponentsStore.isEditingConfigRow(
        props.componentId,
        props.configId,
        props.rowId,
        props.fieldName
      ),
      isSaving: InstalledComponentsStore.isSavingConfigRow(
        props.componentId,
        props.configId,
        props.rowId,
        props.fieldName
      ),
      isValid: InstalledComponentsStore.isValidEditingConfigRow(
        props.componentId,
        props.configId,
        props.rowId,
        props.fieldName
      )
    };
  },

  _handleEditStart() {
    InstalledComponentsActionCreators.startConfigurationRowEdit(
      this.props.componentId,
      this.props.configId,
      this.props.rowId,
      this.props.fieldName,
      this.props.fallbackValue
    );
  },

  _handleEditCancel() {
    InstalledComponentsActionCreators.cancelConfigurationRowEdit(
      this.props.componentId,
      this.props.configId,
      this.props.rowId,
      this.props.fieldName
    );
  },

  _handleEditChange(newValue) {
    InstalledComponentsActionCreators.updateEditingConfigurationRow(
      this.props.componentId,
      this.props.configId,
      this.props.rowId,
      this.props.fieldName,
      newValue
    );
  },

  _handleEditSubmit() {
    InstalledComponentsActionCreators.saveConfigurationRowEdit(
      this.props.componentId,
      this.props.configId,
      this.props.rowId,
      this.props.fieldName
    );
  },

  render() {
    const EditElement = this.props.editElement;

    return (
      <EditElement
        text={this.state.isEditing ? this.state.editValue : this.state.value}
        placeholder={this.props.placeholder}
        tooltipPlacement={this.props.tooltipPlacement}
        isSaving={this.state.isSaving}
        isEditing={this.state.isEditing}
        isValid={!!this.state.isValid}
        onEditStart={this._handleEditStart}
        onEditCancel={this._handleEditCancel}
        onEditChange={this._handleEditChange}
        onEditSubmit={this._handleEditSubmit}
      />
    );
  }
});
