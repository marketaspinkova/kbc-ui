import PropTypes from 'prop-types';
import React from 'react';
import Edit from './TemplatedConfigurationEdit';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import ComponentsStore from '../../stores/ComponentsStore';
import TemplatesStore from '../../stores/TemplatesStore';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import Markdown from '../../../../react/common/Markdown';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore, TemplatesStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config'),
      componentId = RoutesStore.getCurrentRouteParam('component'),
      component = ComponentsStore.getComponent(componentId);

    const isTemplate = TemplatesStore.isConfigTemplate(
      componentId,
      InstalledComponentsStore.getTemplatedConfigValueConfig(componentId, configId)
    ) || InstalledComponentsStore.getTemplatedConfigValueWithoutUserParams(componentId, configId).isEmpty();

    return {
      componentId: componentId,
      configId: configId,
      component: ComponentsStore.getComponent(componentId),
      config: InstalledComponentsStore.getTemplatedConfigValueConfig(componentId, configId),
      configSchema: component.get('configurationSchema'),
      configTemplates: TemplatesStore.getConfigTemplates(componentId),
      isTemplate: isTemplate,
      isChanged: InstalledComponentsStore.isChangedTemplatedConfig(componentId, configId),
      isSaving: InstalledComponentsStore.isSavingConfigData(componentId, configId),
      isEditingString: InstalledComponentsStore.isTemplatedConfigEditingString(componentId, configId),

      editingParams: InstalledComponentsStore.getTemplatedConfigEditingValueParams(componentId, configId),
      editingTemplate: InstalledComponentsStore.getTemplatedConfigEditingValueTemplate(componentId, configId),
      editingString: InstalledComponentsStore.getTemplatedConfigEditingValueString(componentId, configId)
    };
  },

  propTypes: {
    headerText: PropTypes.string,
    saveLabel: PropTypes.string,
    help: PropTypes.node
  },

  getDefaultProps() {
    return {
      headerText: 'Configuration Data',
      help: null,
      saveLabel: 'Save configuration'
    };
  },

  render() {
    return (
      <div>
        <h2>{this.props.headerText}</h2>
        {this.props.help}
        {this.renderHelp()}
        {this.renderEditor()}
      </div>
    );
  },

  renderEditor() {
    return (
      <Edit
        isTemplate={this.state.isTemplate}
        editingTemplate={this.state.editingTemplate}
        editingParams={this.state.editingParams}
        editingString={this.state.editingString}
        isEditingString={this.state.isEditingString}
        templates={this.state.configTemplates}
        paramsSchema={this.state.configSchema}
        isValid={this.isValid()}
        isSaving={this.state.isSaving}
        isChanged={this.state.isChanged}
        onSave={this.onEditSubmit}
        onChangeTemplate={this.onEditChangeTemplate}
        onChangeString={this.onEditChangeString}
        onChangeParams={this.onEditChangeParams}
        onChangeEditingMode={this.onEditChangeEditingMode}
        onCancel={this.onEditCancel}
        saveLabel={this.props.saveLabel}

      />
    );
  },

  onEditCancel() {
    InstalledComponentsActionCreators.cancelEditTemplatedComponentConfigData(this.state.componentId, this.state.configId);
  },

  onEditSubmit() {
    InstalledComponentsActionCreators.saveEditTemplatedComponentConfigData(this.state.componentId, this.state.configId);
  },

  onEditChangeTemplate(value) {
    InstalledComponentsActionCreators.updateEditTemplatedComponentConfigDataTemplate(this.state.componentId, this.state.configId, value);
  },

  onEditChangeString(value) {
    InstalledComponentsActionCreators.updateEditTemplatedComponentConfigDataString(this.state.componentId, this.state.configId, value);
  },

  onEditChangeParams(value) {
    InstalledComponentsActionCreators.updateEditTemplatedComponentConfigDataParams(this.state.componentId, this.state.configId, value);
  },

  onEditChangeEditingMode(isStringEditingMode) {
    this.onEditCancel();
    InstalledComponentsActionCreators.toggleEditTemplatedComponentConfigDataString(this.state.componentId, this.state.configId, isStringEditingMode);
  },

  isValid() {
    if (this.state.editingString) {
      try {
        JSON.parse(this.state.editingString);
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  },

  renderHelp() {
    if (!this.state.component.get('configurationDescription')) {
      return null;
    }
    return (
      <Markdown
        source={this.state.component.get('configurationDescription')}
        size="small"
      />
    );
  }
});
