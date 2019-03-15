import PropTypes from 'prop-types';
import React from 'react';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import NewConfigurationsStore from '../../../stores/NewConfigurationsStore';
import NewConfigurationsActionCreators from '../../../NewConfigurationsActionCreators';
import DefaultForm from './DefaultForm';
import GoodDataWriterForm from './GoodDataWriterForm';
import ManualConfigurationForm from './ManualConfigurationFrom';

export default React.createClass({
  mixins: [createStoreMixin(NewConfigurationsStore)],

  propTypes: {
    component: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
  },

  getStateFromStores() {
    const componentId = this.props.component.get('id');

    return {
      configuration: NewConfigurationsStore.getConfiguration(componentId),
      isValid: NewConfigurationsStore.isValidConfiguration(componentId),
      isSaving: NewConfigurationsStore.isSavingConfiguration(componentId)
    };
  },

  componentDidMount() {
    NewConfigurationsActionCreators.resetConfiguration(this.props.component.get('id'));
  },

  _handleReset() {
    this.props.onClose();
  },

  _handleChange(newConfiguration) {
    NewConfigurationsActionCreators.updateConfiguration(this.props.component.get('id'), newConfiguration);
  },

  _handleSave() {
    NewConfigurationsActionCreators.saveConfiguration(this.props.component.get('id'));
  },

  render() {
    const FormHandler = this._getFormHandler();

    return (
      <FormHandler
        component={this.props.component}
        configuration={this.state.configuration}
        isValid={this.state.isValid}
        isSaving={this.state.isSaving}
        onCancel={this._handleReset}
        onChange={this._handleChange}
        onSave={this._handleSave}
        onClose={this.props.onClose}
      />
    );
  },

  _getFormHandler() {
    const hasUI =
      this.props.component.get('hasUI') ||
      this.props.component.get('flags').includes('genericUI') ||
      this.props.component.get('flags').includes('genericDockerUI') ||
      this.props.component.get('flags').includes('genericTemplatesUI');

    if (!hasUI) {
      return ManualConfigurationForm;
    }

    switch (this.props.component.get('id')) {
      case 'gooddata-writer':
        return GoodDataWriterForm;
      default:
        return DefaultForm;
    }
  }
});
