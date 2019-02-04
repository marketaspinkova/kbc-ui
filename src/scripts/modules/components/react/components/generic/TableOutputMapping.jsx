import React, {PropTypes} from 'react';
import Detail from './TableOutputMappingDetail';
import Header from './TableOutputMappingHeader';
import {Panel} from 'react-bootstrap';
import Immutable from 'immutable';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Add from './AddTableOutputMapping';
import {getOutputMappingValue, findOutputMappingDefinition} from '../../../utils/mappingDefinitions';

export default React.createClass({
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
    return getOutputMappingValue(this.props.definitions, this.props.value);
  },

  content() {
    var component = this;
    if (this.getValue().count() >= 1) {
      var mappings = this.getValue().map(function(output, key) {
        const definition = findOutputMappingDefinition(component.props.definitions, output);
        return React.createElement(Panel,
          {
            className: 'kbc-panel-heading-with-table',
            key: key,
            collapsible: true,
            eventKey: key,
            expanded: component.props.openMappings.get('table-output-' + key, false),
            header: React.createElement('div',
              {
                onClick: function() {
                  component.toggleMapping(key);
                }
              }, React.createElement(Header,
                {
                  value: output,
                  editingValue: component.props.editingValue.get(key, Immutable.Map()),
                  tables: component.props.tables,
                  buckets: component.props.buckets,
                  mappingIndex: key,
                  pendingActions: component.props.pendingActions,
                  definition: definition,
                  onEditStart: function() {
                    return component.onEditStart(key);
                  },
                  onChange: function(value) {
                    var modifiedValue = value;
                    if (definition.has('source')) {
                      modifiedValue = modifiedValue.set('source', definition.get('source'));
                    }
                    return component.onChangeMapping(key, modifiedValue);
                  },
                  onSave: function() {
                    return component.onSaveMapping(key);
                  },
                  onCancel: function() {
                    return component.onCancelEditMapping(key);
                  },
                  onDelete: function() {
                    return component.onDeleteMapping(key);
                  }
                }))
          },
          React.createElement(Detail,
            {
              value: output
            }
          )
        );
      }).toJS();
      return (
        <span>
          {mappings}
        </span>
      );
    } else {
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
    }
  }
});
