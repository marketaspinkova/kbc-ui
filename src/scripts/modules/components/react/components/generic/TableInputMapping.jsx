import React, {PropTypes} from 'react';
import Detail from './TableInputMappingDetail';
import Header from './TableInputMappingHeader';
import {Panel} from 'react-bootstrap';
import Immutable from 'immutable';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Add from './AddTableInputMapping';
import {getInputMappingValue, findInputMappingDefinition} from '../../../utils/mappingDefinitions';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    editingValue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    openMappings: PropTypes.object.isRequired,
    hideDestinationInfo: PropTypes.bool.isRequired,
    definitions: PropTypes.object
  },

  getDefaultProps: function() {
    return {
      definitions: Immutable.List()
    };
  },

  inputMappingDestinations(exclude) {
    return this.getValue().map(function(mapping, key) {
      if (key !== exclude) {
        return mapping.get('destination').toLowerCase();
      }
    }).filter(function(destination) {
      return typeof destination !== 'undefined';
    });
  },

  render() {
    var addButton;
    if (this.getValue().count() >= 1 && this.props.definitions.count() === 0) {
      addButton = (
        <span className="pull-right">
          <Add
            tables={this.props.tables}
            componentId={this.props.componentId}
            configId={this.props.configId}
            mapping={this.props.editingValue.toMap().get('new-mapping', Immutable.Map())}
            otherDestinations={this.inputMappingDestinations()}
          />
        </span>
      );
    }
    return (
      <div>
        <h2>Table Input Mapping
          {addButton}
        </h2>
        {this.content()}
      </div>
    );
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
    return getInputMappingValue(this.props.definitions, this.props.value);
  },

  content() {
    var component = this;
    if (this.getValue().count() >= 1) {
      var mappings = this.getValue().map(function(input, key) {
        const definition = findInputMappingDefinition(component.props.definitions, input);
        return React.createElement(Panel,
          {
            className: 'kbc-panel-heading-with-table',
            key: key,
            collapsible: true,
            eventKey: key,
            expanded: component.props.openMappings.get('table-input-' + key, false),
            header: React.createElement('div',
              {
                onClick: function() {
                  component.toggleMapping(key);
                }
              }, React.createElement(Header,
                {
                  value: input,
                  editingValue: component.props.editingValue.get(key, Immutable.Map()),
                  tables: component.props.tables,
                  mappingIndex: key,
                  pendingActions: component.props.pendingActions,
                  otherDestinations: component.inputMappingDestinations(key),
                  hideDestinationInfo: component.props.hideDestinationInfo,
                  definition: definition,
                  onEditStart: function() {
                    return component.onEditStart(key);
                  },
                  onChange: function(value) {
                    var modifiedValue = value;
                    if (definition.has('destination')) {
                      modifiedValue = modifiedValue.set('destination', definition.get('destination'));
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
              value: input
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
          <p>No table input mapping assigned.</p>
          <Add
            tables={this.props.tables}
            componentId={this.props.componentId}
            configId={this.props.configId}
            mapping={this.props.editingValue.toMap().get('new-mapping', Immutable.Map())}
            otherDestinations={this.inputMappingDestinations()}
          />
        </div>
      );
    }
  }
});
