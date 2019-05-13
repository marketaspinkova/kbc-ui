import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import {Map} from 'immutable';
import {Panel} from 'react-bootstrap';
import InstalledComponentsActions from '../../../InstalledComponentsActionCreators';
import Detail from './FileInputMappingDetail';
import Header from './FileInputMappingHeader';
import Add from './AddFileInputMapping';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    editingValue: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    openMappings: PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <h2>File Input Mapping {this.renderAddButton()}</h2>
        <small className="help-block">
          Multiple files may match the given criteria. All files will be stored in <code>/data/in/files/</code> with their IDs as file names.
          <br />All metadata will be stored in a manifest file.
        </small>
        {this.renderContent()}
      </div>
    );
  },

  renderAddButton() {
    if (!this.props.value.count()) {
      return null;
    }

    return (
      <span className="pull-right">
        <Add
          componentId={this.props.componentId}
          configId={this.props.configId}
          mapping={this.props.editingValue.get('new-mapping', Map())}
        />
      </span>
    );
  },

  renderContent() {
    if (this.props.value.count() >= 1) {
      return (
        <span>
          {this.props.value.map(this.renderPanel).toArray()}
        </span>
      );
    }

    return (
      <div className="well text-center">
        <p>No file input mapping assigned.</p>
        <Add
          componentId={this.props.componentId}
          configId={this.props.configId}
          mapping={this.props.editingValue.get('new-mapping', Map())}
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
        expanded={this.props.openMappings.get('file-input-' + key, false)}
        header={this.renderHeader(input, key)}
      >
        <Detail value={input} />
      </Panel>
    );
  },

  renderHeader(input, key) {
    return (
      <div onClick={() => this.toggleMapping(key)}>
        <Header
          value={input}
          editingValue={this.props.editingValue.get(key, Map())}
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
  },

  toggleMapping(key) {
    return InstalledComponentsActions.toggleMapping(this.props.componentId, this.props.configId, 'file-input-' + key);
  },

  onChangeMapping(key, value) {
    return InstalledComponentsActions.changeEditingMapping(this.props.componentId, this.props.configId, 'input', 'files', key, value);
  },

  onEditStart(key) {
    return InstalledComponentsActions.startEditingMapping(this.props.componentId, this.props.configId, 'input', 'files', key);
  },

  onSaveMapping(key) {
    return InstalledComponentsActions.saveEditingMapping(this.props.componentId, this.props.configId, 'input', 'files', key, 'Update file input');
  },

  onCancelEditMapping(key) {
    return InstalledComponentsActions.cancelEditingMapping(this.props.componentId, this.props.configId, 'input', 'files', key);
  },

  onDeleteMapping(key) {
    return InstalledComponentsActions.deleteMapping(this.props.componentId, this.props.configId, 'input', 'files', key, 'Delete file input');
  }
});
