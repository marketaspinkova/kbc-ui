import React from 'react';
import Immutable from 'immutable';

// stores
import Store from '../../ConfigurationRowsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ConfigurationsStore from '../../ConfigurationsStore';
import TablesStore from '../../../components/stores/StorageTablesStore';
import DockerActionsStore from '../../DockerActionsStore';

// actions
import Actions from '../../ConfigurationRowsActionCreators';

// global components
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import ConfigurationRowDescription from '../components/ConfigurationRowDescription';
import ConfigurationRowMetadata from '../components/ConfigurationRowMetadata';
import DeleteConfigurationRowButton from '../components/DeleteConfigurationRowButton';
import ClearStateButton from '../components/ClearStateButton';
import JsonConfiguration from '../components/JsonConfiguration';
import SaveButtons from '../../../../react/common/SaveButtons';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import LatestRowVersions from '../components/SidebarRowVersionsWrapper';
import SidebarJobsContainer from '../../../components/react/components/SidebarJobsContainer';

// adapters
import isParsableConfiguration from '../../utils/isParsableConfiguration';
import sections from '../../utils/sections';
import dockerActions from '../../DockerActionsActionCreators';

export default React.createClass({
  mixins: [createStoreMixin(Store, TablesStore, DockerActionsStore)],

  getStateFromStores() {
    const settings = RoutesStore.getRouteSettings();
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const rowId = RoutesStore.getCurrentRouteParam('row');
    const componentId = settings.get('componentId');
    const row = Store.get(componentId, configurationId, rowId);
    const rowConfiguration = Store.getConfiguration(componentId, configurationId, rowId);
    const isJsonConfigurationValid = Store.isEditingJsonConfigurationValid(componentId, configurationId, rowId);
    const createBySectionsFn = sections.makeCreateFn(
      settings.getIn(['row', 'sections'])
    );
    const conformFn = settings.getIn(['row', 'onConform'], (config) => config);
    let context = ConfigurationsStore.getConfigurationContext(componentId, configurationId);
    const parseTableIdFn = settings.getIn(['row', 'parseTableId']);
    if (parseTableIdFn) {
      const tableId = parseTableIdFn(rowConfiguration);
      const table = TablesStore.get(tableId);
      context = context.set('table', table).set('tableId', tableId);
    }
    const parseBySectionsFn = sections.makeParseFn(
      settings.getIn(['row', 'sections']),
      conformFn,
      context
    );
    const storedConfigurationSections = parseBySectionsFn(
      rowConfiguration
    );

    return {
      componentId: componentId,
      settings: settings,
      configurationId: configurationId,
      configuration: ConfigurationsStore.get(componentId, configurationId),
      rowId: rowId,
      row: row,

      jsonConfigurationValue: Store.getEditingJsonConfigurationString(componentId, configurationId, rowId),
      isJsonConfigurationSaving: Store.getPendingActions(componentId, configurationId, rowId).has('save-json'),
      isJsonConfigurationValid: isJsonConfigurationValid,
      isJsonConfigurationChanged: Store.isEditingJsonConfiguration(componentId, configurationId, rowId),
      isJsonConfigurationParsable:
        isJsonConfigurationValid &&
        isParsableConfiguration(
          conformFn(Immutable.fromJS(Store.getEditingJsonConfiguration(componentId, configurationId, rowId))),
          parseBySectionsFn,
          createBySectionsFn
        ),

      isParsableConfiguration: isParsableConfiguration(
        conformFn(Store.getConfiguration(componentId, configurationId, rowId)),
        parseBySectionsFn,
        createBySectionsFn
      ),
      isJsonEditorOpen: Store.hasJsonEditor(componentId, configurationId, rowId, parseBySectionsFn, createBySectionsFn, conformFn),
      createBySectionsFn,
      parseBySectionsFn,
      storedConfigurationSections,
      configurationBySections: Store.getEditingConfiguration(componentId, configurationId, rowId, parseBySectionsFn),
      isSaving: Store.getPendingActions(componentId, configurationId, rowId).has('save-configuration'),
      isChanged: Store.isEditingConfiguration(componentId, configurationId, rowId),

      isDeletePending: Store.getPendingActions(componentId, configurationId, rowId).has('delete'),
      isEnableDisablePending:
        Store.getPendingActions(componentId, configurationId, rowId).has('enable') ||
        Store.getPendingActions(componentId, configurationId, rowId).has('disable'),

      hasState: !Store.get(componentId, configurationId, rowId)
        .get('state', Immutable.Map())
        .isEmpty(),
      isClearStatePending: Store.getPendingActions(componentId, configurationId, rowId).has('clear-state')
    };
  },

  componentDidMount() {
    dockerActions.reloadIndexSyncActions(this.state.componentId, this.state.configurationId);
    dockerActions.reloadRowSyncActions(this.state.componentId, this.state.configurationId, this.state.rowId);
  },

  renderActions() {
    const state = this.state;
    const settings = this.state.settings;
    let actions = [];
    actions.push(
      <li key="run">
        <RunComponentButton
          title="Run"
          component={this.state.componentId}
          mode="link"
          runParams={() => ({
            config: state.configurationId,
            row: state.rowId
          })}
        >
          {this.renderRunModalContent()}
        </RunComponentButton>
      </li>
    );
    actions.push(
      <li key="activate">
        <ActivateDeactivateButton
          key="activate"
          activateTooltip="Enable"
          deactivateTooltip="Disable"
          isActive={!this.state.row.get('isDisabled', false)}
          isPending={this.state.isEnableDisablePending}
          onChange={function() {
            if (state.row.get('isDisabled', false)) {
              const changeDescription =
                settings.getIn(['row', 'name', 'singular']) + ' ' + state.row.get('name') + ' enabled';
              return Actions.enable(state.componentId, state.configurationId, state.rowId, changeDescription);
            } else {
              const changeDescription =
                settings.getIn(['row', 'name', 'singular']) + ' ' + state.row.get('name') + ' disabled';
              return Actions.disable(state.componentId, state.configurationId, state.rowId, changeDescription);
            }
          }}
          mode="link"
        />
      </li>
    );
    if (settings.getIn(['row', 'hasState'])) {
      actions.push(
        <li className={this.state.isClearStatePending || !this.state.hasState ? 'disabled' : ''} key="clear-state">
          <ClearStateButton
            onClick={() => Actions.clearState(state.componentId, state.configurationId, state.rowId)}
            isPending={this.state.isClearStatePending}
            disabled={!this.state.hasState}
          >
            Delete the current stored state of the configuration, eg. progress of an incremental processes.
          </ClearStateButton>
        </li>
      );
    }
    actions.push(
      <li key="delete">
        <DeleteConfigurationRowButton
          onClick={function() {
            const changeDescription =
              settings.getIn(['row', 'name', 'singular']) + ' ' + state.row.get('name') + ' deleted';
            return Actions.delete(state.componentId, state.configurationId, state.rowId, true, changeDescription);
          }}
          isPending={this.state.isDeletePending}
          mode="link"
        />
      </li>
    );
    return actions;
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ConfigurationRowDescription
              componentId={this.state.componentId}
              configId={this.state.configurationId}
              rowId={this.state.rowId}
            />
          </div>
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            {this.state.isJsonEditorOpen || !this.state.isParsableConfiguration
              ? this.renderJsonEditor()
              : this.renderForm()}
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ConfigurationRowMetadata
            componentId={this.state.componentId}
            configurationId={this.state.configurationId}
            rowId={this.state.rowId}
          />
          <ul className="nav nav-stacked">{this.renderActions()}</ul>
          <SidebarJobsContainer
            componentId={this.state.componentId}
            configId={this.state.configurationId}
            rowId={this.state.rowId}
            limit={3}
          />
          <LatestRowVersions
            componentId={this.state.componentId}
            configId={this.state.configurationId}
            rowId={this.state.rowId}
          />
        </div>
      </div>
    );
  },

  // deprecated
  renderOldWay() {
    return (
      <div className="col-md-9 kbc-main-content">
        <div className="kbc-inner-content-padding-fix with-bottom-border">
          <ConfigurationRowDescription
            componentId={this.state.componentId}
            configId={this.state.configurationId}
            rowId={this.state.rowId}
          />
        </div>
        <div className="kbc-inner-content-padding-fix with-bottom-border">
          {this.state.isJsonEditorOpen || !this.state.isParsableConfiguration
            ? this.renderJsonEditor()
            : this.renderForm()}
        </div>
      </div>
    );
  },

  onUpdateSection(sectionKey, diff) {
    const { configurationBySections, componentId, configurationId, rowId } = this.state;
    const newConfigurationBySections = configurationBySections.set(
      sectionKey,
      configurationBySections.get(sectionKey).merge(Immutable.fromJS(diff))
    );
    const created = this.state.createBySectionsFn(newConfigurationBySections);
    const parsed = this.state.parseBySectionsFn(created);
    Actions.updateConfiguration(componentId, configurationId, rowId, parsed);
  },

  renderSections() {
    const state = this.state;
    const settingsSections = this.state.settings.getIn(['row', 'sections']);
    const { storedConfigurationSections } = this.state;
    const returnTrue = () => true;

    let actionsData = Immutable.Map();
    this.state.settings.getIn(['index', 'actions'], Immutable.List()).forEach((action) => {
      actionsData = actionsData.set(action.get('name'), DockerActionsStore.get(
        state.settings.get('componentId'),
        action,
        state.configuration.get('configuration')
      ));
    });
    this.state.settings.getIn(['row', 'actions'], Immutable.List()).forEach((action) => {
      actionsData = actionsData.set(action.get('name'), DockerActionsStore.get(
        state.settings.get('componentId'),
        action,
        state.configuration.get('configuration'),
        state.row.get('configuration')
      ));
    });

    return settingsSections.map((section, key) => {
      const SectionComponent = section.get('render');
      const onSectionSave = section.get('onSave');
      const sectionIsCompleteFn = section.get('isComplete') || returnTrue;
      const isComplete = sectionIsCompleteFn(onSectionSave(storedConfigurationSections.get(key)));
      return (
        <div key={key}>
          <SectionComponent
            isComplete={isComplete}
            disabled={this.state.isSaving}
            onChange={diff => this.onUpdateSection(key, diff)}
            value={this.state.configurationBySections.get(key).toJS()}
            actions={actionsData}
          />
        </div>
      );
    });
  },

  renderRunModalContent() {
    const rowName = this.state.row.get('name', 'Untitled');
    let changedMessage = '';
    if (this.state.isJsonConfigurationChanged || this.state.isChanged) {
      changedMessage = (
        <p>
          <strong>{'The configuration has unsaved changes.'}</strong>
        </p>
      );
    }
    if (this.state.row.get('isDisabled')) {
      return (
        <span>
          {changedMessage}
          <p>
            You are about to run {rowName}. Configuration {rowName} is disabled and will be forced to run.
          </p>
        </span>
      );
    } else {
      return (
        <span>
          {changedMessage}
          <p>You are about to run {rowName}.</p>
        </span>
      );
    }
  },

  renderButtons() {
    const state = this.state;
    const settings = this.state.settings;
    return (
      <div className="form-group">
        <div className="text-right">
          <SaveButtons
            isSaving={this.state.isSaving}
            isChanged={this.state.isChanged}
            onSave={function() {
              const changeDescription =
                settings.getIn(['row', 'name', 'singular']) + ' ' + state.row.get('name') + ' edited';
              return Actions.saveConfiguration(
                state.componentId,
                state.configurationId,
                state.rowId,
                state.createBySectionsFn,
                state.parseBySectionsFn,
                changeDescription
              );
            }}
            onReset={function() {
              return Actions.resetConfiguration(state.componentId, state.configurationId, state.rowId);
            }}
          />
        </div>
      </div>
    );
  },

  renderOpenJsonLink() {
    const state = this.state;
    return (
      <small>
        <a onClick={() => Actions.openJsonEditor(state.componentId, state.configurationId, state.rowId)}>
          Open JSON editor
        </a>{' '}
        (discards all unsaved changes)
      </small>
    );
  },

  renderCloseJsonLink() {
    const state = this.state;
    if (!this.state.isParsableConfiguration) {
      return (
        <small>
          Can&apos;t close JSON editor, configuration is not compatible. Revert your changes to allow switching back to the
          visual form.
        </small>
      );
    }
    return (
      <small>
        <a onClick={() => Actions.closeJsonEditor(state.componentId, state.configurationId, state.rowId)}>
          Close JSON editor
        </a>{' '}
        (discards all unsaved changes)
      </small>
    );
  },

  renderForm() {
    return (
      <div>
        {this.renderOpenJsonLink()}
        <h2>Configuration</h2>
        {this.renderButtons()}
        {this.renderSections()}
      </div>
    );
  },

  renderJsonEditor() {
    const state = this.state;
    const settings = this.state.settings;
    return [
      <div key="close">{this.renderCloseJsonLink()}</div>,
      <JsonConfiguration
        key="json-configuration"
        isSaving={this.state.isJsonConfigurationSaving}
        value={this.state.jsonConfigurationValue}
        isEditingValid={this.state.isJsonConfigurationValid}
        isChanged={this.state.isJsonConfigurationChanged}
        onEditCancel={() => Actions.resetJsonConfiguration(state.componentId, state.configurationId, state.rowId)}
        onEditChange={parameters =>
          Actions.updateJsonConfiguration(state.componentId, state.configurationId, state.rowId, parameters)
        }
        onEditSubmit={() => {
          const changeDescription =
            settings.getIn(['row', 'name', 'singular']) +
            ' ' +
            state.row.get('name') +
            ' configuration edited manually';
          return Actions.saveJsonConfiguration(
            state.componentId,
            state.configurationId,
            state.rowId,
            changeDescription
          );
        }}
        showSaveModal={this.state.isParsableConfiguration && !this.state.isJsonConfigurationParsable}
        saveModalTitle="Save Parameters"
        saveModalBody={
          <div>
            The changes in the configuration are not compatible with the original visual form. Saving this configuration
            will disable the visual representation of the whole configuration and you will be able to edit the
            configuration in JSON editor only.
          </div>
        }
      />
    ];
  }
});
