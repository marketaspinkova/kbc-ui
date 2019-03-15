import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { SearchBar } from '@keboola/indigo-ui';

import ComponentSelect from './ComponentSelect';
import ConfigurationSelect from './ConfigurationSelect';
import OrchestrationSelect from './OrchestrationSelect';
import ComponentsReloaderButton from '../../components/ComponentsReloaderButton';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import matchByWords from '../../../../../utils/matchByWords';

const STEP_COMPONENT_SELECT = 'componentSelect';
const STEP_CONFIGURATION_SELECT = 'configurationSelect';
const STEP_ORCHESTRATOR_CONFIGURATION_SELECT = 'orchestratorConfigurationSelect';

export default createReactClass({
  propTypes: {
    onConfigurationSelect: PropTypes.func.isRequired,
    onHide: PropTypes.func,
    show: PropTypes.bool,
    phaseId: PropTypes.string,
    searchQuery: PropTypes.string,
    onChangeSearchQuery: PropTypes.func.isRequired
  },

  mixins: [createStoreMixin(InstalledComponentsStore, OrchestrationStore), immutableMixin],

  getInitialState() {
    return {
      selectedComponent: null,
      currentStep: STEP_COMPONENT_SELECT
    };
  },

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const currentOrchestration = OrchestrationStore.get(orchestrationId);

    return {
      components: InstalledComponentsStore.getAll().filter(c => !c.get('flags').includes('excludeRun')),
      orchestrations: OrchestrationStore.getAll().filter(
        orchestration =>
          !orchestration.get('crontabRecord') && currentOrchestration.get('id') !== orchestration.get('id')
      )
    };
  },

  _getFilteredComponents() {
    const filter = this.props.searchQuery.toLowerCase();
    return this.state.components.filter(component => {
      const name = component.get('name', '').toLowerCase();
      const id = component.get('id', '').toLowerCase();
      return matchByWords(name, filter) || matchByWords(id, filter);
    });
  },

  _getFilteredOrchestrations() {
    const filter = this.props.searchQuery.toLowerCase();
    return this.state.orchestrations.filter(() => matchByWords('orchestrator', filter));
  },

  _handleOnHide() {
    this._handleComponentReset();
    return this.props.onHide();
  },

  render() {
    return (
      <Modal onHide={this._handleOnHide} show={this.props.show}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {`Add new task to ${this.props.phaseId} `}
            <ComponentsReloaderButton />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{this._renderBody()}</Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button bsStyle="link" onClick={this._handleOnHide}>
              Cancel
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  _renderBody() {
    switch (this.state.currentStep) {
      case STEP_COMPONENT_SELECT:
        return (
          <div>
            <SearchBar query={this.props.searchQuery} onChange={this.props.onChangeSearchQuery} />
            <div className="orchestration-task-modal-body">
              <ComponentSelect
                orchestrations={this._getFilteredOrchestrations()}
                components={this._getFilteredComponents()}
                onComponentSelect={this._handleComponentSelect}
              />
            </div>
          </div>
        );

      case STEP_CONFIGURATION_SELECT:
        return (
          <div className="orchestration-task-modal-body">
            <ConfigurationSelect
              component={this.state.selectedComponent}
              onReset={this._handleComponentReset}
              onConfigurationSelect={this._handleConfigurationSelect}
            />
          </div>
        );

      case STEP_ORCHESTRATOR_CONFIGURATION_SELECT:
        return (
          <div className="orchestration-task-modal-body">
            <OrchestrationSelect
              component={this.state.selectedComponent}
              orchestrations={this.state.orchestrations}
              onReset={this._handleComponentReset}
              onConfigurationSelect={this._handleConfigurationSelect}
              orchestratorConfigurations={this._getFilteredComponents().getIn(['orchestrator', 'configurations'])}
            />
          </div>
        );

      default:
        return null;
    }
  },

  _handleComponentSelect(component) {
    return this.setState({
      selectedComponent: component,
      currentStep:
        component.get('id') === 'orchestrator' ? STEP_ORCHESTRATOR_CONFIGURATION_SELECT : STEP_CONFIGURATION_SELECT
    });
  },

  _handleComponentReset() {
    return this.setState({
      selectedComponent: null,
      currentStep: STEP_COMPONENT_SELECT
    });
  },

  /*
    Configuration is selected
    close modal with selected configuration
  */
  _handleConfigurationSelect(configuration) {
    this.props.onConfigurationSelect(this.state.selectedComponent, configuration, this.props.phaseId);
    return this._handleOnHide();
  }
});
