import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import {Map, List} from 'immutable';
import {Panel} from 'react-bootstrap';
import mappingDefinitions from '../../../utils/mappingDefinitions';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Detail from './TableInputMappingDetail';
import Header from './TableInputMappingHeader';
import Add from './AddTableInputMapping';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    editingValue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    openMappings: PropTypes.object.isRequired,
    definitions: PropTypes.object
  },

  getDefaultProps() {
    return {
      definitions: List()
    };
  },

  render() {
    return (
      <div>
        <h2>Table Input Mapping {this.renderAddButton()}</h2>
        {this.renderContent()}
      </div>
    );
  },

  renderAddButton() {
    if (!this.getValue().count() || this.props.definitions.count()) {
      return null;
    }

    return (
      <span className="pull-right">
        <Add
          tables={this.props.tables}
          componentId={this.props.componentId}
          configId={this.props.configId}
          mapping={this.props.editingValue.get('new-mapping', Map())}
          otherDestinations={this.inputMappingDestinations()}
        />
      </span>
    );
  },

  renderContent() {
    if (this.getValue().count() >= 1) {
      return (
        <span>
          {this.getValue().map(this.renderPanel).toArray()}
        </span>
      );
    }

    return (
      <div className="well text-center">
        <p>No table input mapping assigned.</p>
        <Add
          tables={this.props.tables}
          componentId={this.props.componentId}
          configId={this.props.configId}
          mapping={this.props.editingValue.get('new-mapping', Map())}
          otherDestinations={this.inputMappingDestinations()}
        />
      </div>
    );
  },

  renderPanel(input, key) {
    return (
      <Panel
        key={key}
        eventKey={key}
        collapsible
        className="kbc-panel-heading-with-table"
        expanded={this.props.openMappings.get('table-input-' + key, false)}
        header={this.renderHeader(input, key)}
      >
        <Detail value={input} />
      </Panel>
    );
  },

  renderHeader(input, key) {
    const definition = mappingDefinitions.findInputMappingDefinition(this.props.definitions, input);

    return (
      <div onClick={() => this.toggleMapping(key)}>
        <Header
          value={input}
          editingValue={this.props.editingValue.get(key, Map())}
          tables={this.props.tables}
          mappingIndex={key}
          pendingActions={this.props.pendingActions}
          otherDestinations={this.inputMappingDestinations(key)}
          definition={definition}
          onEditStart={() => this.onEditStart(key)}
          onChange={(value) => {
            let modifiedValue = value;
            if (definition.has('destination')) {
              modifiedValue = modifiedValue.set('destination', definition.get('destination'));
            }
            return this.onChangeMapping(key, modifiedValue);
          }}
          onSave={() => this.onSaveMapping(key)}
          onCancel={() => this.onCancelEditMapping(key)}
          onDelete={() => this.onDeleteMapping(key)}
        />
      </div>
    );
  },

  inputMappingDestinations(exclude) {
    return this.getValue().map((mapping, key) => {
      if (key !== exclude) {
        return mapping.get('destination').toLowerCase();
      }
    }).filter((destination) => typeof destination !== 'undefined');
  },

  toggleMapping(key) {
    return InstalledComponentsActions.toggleMapping(this.props.componentId, this.props.configId, 'table-input-' + key);
  },

  onChangeMapping(key, value) {
    return InstalledComponentsActions.changeEditingMapping(this.props.componentId, this.props.configId, 'input', 'tables', key, value);
  },

  onEditStart(key) {
    return InstalledComponentsActions.startEditingMapping(this.props.componentId, this.props.configId, 'input', 'tables', key);
  },

  onSaveMapping(key) {
    const updatingTableId = this.getValue().get(key).get('source');
    return InstalledComponentsActions.saveEditingMapping(this.props.componentId, this.props.configId, 'input', 'tables', key, `Update input table ${updatingTableId}`);
  },

  onCancelEditMapping(key) {
    return InstalledComponentsActions.cancelEditingMapping(this.props.componentId, this.props.configId, 'input', 'tables', key);
  },

  onDeleteMapping(key) {
    const updatingTableId = this.getValue().get(key).get('source');
    return InstalledComponentsActions.deleteMapping(this.props.componentId, this.props.configId, 'input', 'tables', key, `Delete input table mappping ${updatingTableId}`);
  },

  getValue() {
    return mappingDefinitions.getInputMappingValue(this.props.definitions, this.props.value);
  }
});
