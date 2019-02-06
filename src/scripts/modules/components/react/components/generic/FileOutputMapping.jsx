import React, {PropTypes} from 'react';
import Detail from './FileOutputMappingDetail';
import Header from './FileOutputMappingHeader';
import {Panel} from 'react-bootstrap';
import Immutable from 'immutable';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Add from './AddFileOutputMapping';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    editingValue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    openMappings: PropTypes.object.isRequired
  },

  render() {
    var addButton;
    if (this.props.value.count() >= 1) {
      addButton = (
        <span className="pull-right">
          <Add
            componentId={this.props.componentId}
            configId={this.props.configId}
            mapping={this.props.editingValue.get('new-mapping', Immutable.Map())}
          />
        </span>
      );
    }
    return (
      <div>
        <h2>File Output Mapping
          {addButton}
        </h2>
        <small className="help-block">All files from <code>/out/data/files/</code> will be transferred, this allows you to configure the details or override the manifests.</small>
        {this.content()}
      </div>
    );
  },

  toggleMapping(key) {
    return InstalledComponentsActions.toggleMapping(this.props.componentId, this.props.configId, 'file-output-' + key);
  },

  onChangeMapping(key, value) {
    return InstalledComponentsActions.changeEditingMapping(this.props.componentId, this.props.configId, 'output', 'files', key, value);
  },

  onEditStart(key) {
    return InstalledComponentsActions.startEditingMapping(this.props.componentId, this.props.configId, 'output', 'files', key);
  },

  onSaveMapping(key) {
    return InstalledComponentsActions.saveEditingMapping(this.props.componentId, this.props.configId, 'output', 'files', key, 'Update file output');
  },

  onCancelEditMapping(key) {
    return InstalledComponentsActions.cancelEditingMapping(this.props.componentId, this.props.configId, 'output', 'files', key);
  },

  onDeleteMapping(key) {
    return InstalledComponentsActions.deleteMapping(this.props.componentId, this.props.configId, 'output', 'files', key, 'Delete file output');
  },

  content() {
    var component = this;
    if (this.props.value.count() >= 1) {
      var mappings = this.props.value.map(function(output, key) {
        return (
          <Panel
            className="kbc-panel-heading-with-table"
            key={key}
            collapsible={true}
            eventKey={key}
            expanded={component.props.openMappings.get('file-output-' + key, false)}
            header={<div
              onClick={function() {
                component.toggleMapping(key);
              }}>
              {<Header
                value={output}
                editingValue={component.props.editingValue.get(key, Immutable.Map())}
                mappingIndex={key}
                pendingActions={component.props.pendingActions}
                onEditStart={function() {
                  return component.onEditStart(key);
                }}
                onChange={function(value) {
                  return component.onChangeMapping(key, value);
                }}
                onSave={function() {
                  return component.onSaveMapping(key);
                }}
                onCancel={function() {
                  return component.onCancelEditMapping(key);
                }}
                onDelete={function() {
                  return component.onDeleteMapping(key);
                }} />}
            </div>}>
            <Detail fill={true} value={output} />
          </Panel>
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
          <p>No file output mapping assigned.</p>
          <Add
            componentId={this.props.componentId}
            configId={this.props.configId}
            mapping={this.props.editingValue.get('new-mapping', Immutable.Map())}
          />
        </div>
      );
    }
  }
});
