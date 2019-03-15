import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import actionCreators from '../../../InstalledComponentsActionCreators';
import FileInputMappingModal from './FileInputMappingModal';

export default createReactClass({
  propTypes: {
    mapping: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired
  },

  render() {
    return (
      <FileInputMappingModal
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
      'input',
      'files',
      'new-mapping',
      newMapping
    );
  },

  handleCancel() {
    actionCreators.cancelEditingMapping(this.props.componentId,
      this.props.configId,
      'input',
      'files',
      'new-mapping'
    );
  },

  handleSave() {
    return actionCreators.saveEditingMapping(this.props.componentId,
      this.props.configId,
      'input',
      'files',
      'new-mapping',
      'Add input file'
    );
  }
});
