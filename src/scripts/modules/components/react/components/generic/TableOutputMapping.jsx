import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Detail from './TableOutputMappingDetail';
import Header from './TableOutputMappingHeader';
import {Panel} from 'react-bootstrap';
import Immutable from 'immutable';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Add from './AddTableOutputMapping';
import mappingDefinitions from '../../../utils/mappingDefinitions';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    editingValue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    openMappings: PropTypes.object.isRequired,
    definitions: PropTypes.object
  },

  getDefaultProps: function() {
    return {
      definitions: Immutable.List()
    };
  },

  render() {
    var addButton;
    if (this.getValue().count() >= 1 && this.props.definitions.count() === 0) {
      addButton = (
        <span className="pull-right">
          <Add
            tables={this.props.tables}
            buckets={this.props.buckets}
            componentId={this.props.componentId}
            configId={this.props.configId}
            mapping={this.props.editingValue.get('new-mapping', Immutable.Map())}
          />
        </span>
      );
    }
    return (
      <div>
        <h2>Table Output Mapping
          {addButton}
        </h2>
        {this.content()}
      </div>
    );
  },

  toggleMapping(key) {
    return InstalledComponentsActions.toggleMapping(this.props.componentId, this.props.configId, 'table-output-' + key);
  },

  onChangeMapping(key, value) {
    return InstalledComponentsActions.changeEditingMapping(this.props.componentId, this.props.configId, 'output', 'tables', key, value);
  },

  onEditStart(key) {
    return InstalledComponentsActions.startEditingMapping(this.props.componentId, this.props.configId, 'output', 'tables', key);
  },

  onSaveMapping(key) {
    const updatingTableId = this.getValue().get(key).get('destination');
    return InstalledComponentsActions.saveEditingMapping(this.props.componentId, this.props.configId, 'output', 'tables', key, `Update output table ${updatingTableId}`);
  },

  onCancelEditMapping(key) {
    return InstalledComponentsActions.cancelEditingMapping(this.props.componentId, this.props.configId, 'output', 'tables', key);
  },

  onDeleteMapping(key) {
    const updatingTableId = this.getValue().get(key).get('destination');
    return InstalledComponentsActions.deleteMapping(this.props.componentId, this.props.configId, 'output', 'tables', key, `Delete output table mappping ${updatingTableId}`);
  },

  getValue() {
    return mappingDefinitions.getOutputMappingValue(this.props.definitions, this.props.value);
  },

  content() {
    if (this.getValue().count() >= 1) {
      return (
        <span>
          {this.getValue().map(this.renderPanel).toArray()}
        </span>
      );
    }

    return (
      <div className="well text-center">
        <p>No table output mapping assigned.</p>
        <Add
          tables={this.props.tables}
          buckets={this.props.buckets}
          componentId={this.props.componentId}
          configId={this.props.configId}
          mapping={this.props.editingValue.get('new-mapping', Immutable.Map())}
        />
      </div>
    );
  },

  renderPanel(output, key) {
    return (
      <Panel
        collapsible
        className="kbc-panel-heading-with-table"
        key={key}
        eventKey={key}
        expanded={this.props.openMappings.get('table-output-' + key, false)}
        header={this.renderHeader(output, key)}
      >
        <Detail value={output} />
      </Panel>
    );
  },

  renderHeader(output, key) {
    const definition = mappingDefinitions.findOutputMappingDefinition(this.props.definitions, output);

    return (
      <div onClick={() => this.toggleMapping(key)}>
        <Header
          value={output}
          editingValue={this.props.editingValue.get(key, Immutable.Map())}
          tables={this.props.tables}
          buckets={this.props.buckets}
          mappingIndex={key}
          pendingActions={this.props.pendingActions}
          definition={definition}
          onEditStart={() => this.onEditStart(key)}
          onChange={(value) => {
            let modifiedValue = value;
            if (definition.has('source')) {
              modifiedValue = modifiedValue.set('source', definition.get('source'));
            }
            return this.onChangeMapping(key, modifiedValue);
          }}
          onSave={() => this.onSaveMapping(key)}
          onCancel={() => this.onCancelEditMapping(key)}
          onDelete={() => this.onDeleteMapping(key)}
        />
      </div>
    );
  }
});
