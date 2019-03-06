import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore), PureRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    fieldName: React.PropTypes.string.isRequired,
    editElement: React.PropTypes.func.isRequired,
    placeholder: React.PropTypes.string,
    tooltipPlacement: React.PropTypes.string
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
