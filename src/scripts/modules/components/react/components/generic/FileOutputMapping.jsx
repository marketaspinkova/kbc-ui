import PropTypes from 'prop-types';
import React from 'react';
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
    if (this.props.value.count() >= 1) {
      return (
        <span>
          {this.props.value.map(this.renderPanel).toArray()}
        </span>
      );
    }

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
  },

  renderPanel(output, key) {
    return (
      <Panel
        collapsible
        className="kbc-panel-heading-with-table"
        key={key}
        eventKey={key}
        expanded={this.props.openMappings.get('file-output-' + key, false)}
        header={this.renderHeader(output, key)}
      >
        <Detail fill value={output} />
      </Panel>
    );
  },

  renderHeader(output, key) {
    return (
      <div onClick={() => this.toggleMapping(key)}>
        <Header
          value={output}
          editingValue={this.props.editingValue.get(key, Immutable.Map())}
          mappingIndex={key}
          pendingActions={this.props.pendingActions}
          onEditStart={() => this.onEditStart(key)}
          onChange={(value) => this.onChangeMapping(key, value)}
          onSave={() => this.onSaveMapping(key)}
          onCancel={() => this.onCancelEditMapping(key)}
          onDelete={() => this.onDeleteMapping(key)}
        />
      </div>
    );
  }
});
