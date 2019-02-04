import React from 'react';
import actionCreators from '../../../InstalledComponentsActionCreators';
import FileOutputMappingModal from './FileOutputMappingModal';

export default React.createClass({
  propTypes: {
    mapping: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <FileOutputMappingModal
        mode="create"
        mapping={this.props.mapping}
        onChange={this.handleChange}
        onCancel={this.handleCancel}
        onSave={this.handleSave}
      />
    );
  },

  handleChange(newMapping) {
    actionCreators.changeEditingMapping(this.props.componentId,
      this.props.configId,
      'output',
      'files',
      'new-mapping',
      newMapping
    );
  },

  handleCancel() {
    actionCreators.cancelEditingMapping(this.props.componentId,
      this.props.configId,
      'output',
      'files',
      'new-mapping'
    );
  },

  handleSave() {
    return actionCreators.saveEditingMapping(this.props.componentId,
      this.props.configId,
      'output',
      'files',
      'new-mapping',
      'Add file output'
    );
  }
});
