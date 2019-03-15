import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore), immutableMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    editElement: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      placeholder: 'Describe the component ...',
      tooltipPlacement: 'top'
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getState(nextProps));
  },

  getStateFromStores() {
    return this.getState(this.props);
  },

  getState(props) {
    return {
      value: InstalledComponentsStore.getConfig(props.componentId, props.configId).get(props.fieldName),
      editValue: InstalledComponentsStore.getEditingConfig(props.componentId, props.configId, props.fieldName),
      isEditing: InstalledComponentsStore.isEditingConfig(props.componentId, props.configId, props.fieldName),
      isSaving: InstalledComponentsStore.isSavingConfig(props.componentId, props.configId, props.fieldName),
      isValid: InstalledComponentsStore.isValidEditingConfig(props.componentId, props.configId, props.fieldName)
    };
  },

  _handleEditStart() {
    InstalledComponentsActionCreators.startConfigurationEdit(
      this.props.componentId,
      this.props.configId,
      this.props.fieldName
    );
  },

  _handleEditCancel() {
    InstalledComponentsActionCreators.cancelConfigurationEdit(
      this.props.componentId,
      this.props.configId,
      this.props.fieldName
    );
  },

  _handleEditChange(newValue) {
    InstalledComponentsActionCreators.updateEditingConfiguration(
      this.props.componentId,
      this.props.configId,
      this.props.fieldName,
      newValue
    );
  },

  _handleEditSubmit() {
    InstalledComponentsActionCreators.saveConfigurationEdit(
      this.props.componentId,
      this.props.configId,
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
