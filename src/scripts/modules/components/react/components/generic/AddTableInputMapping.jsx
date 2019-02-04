import React from 'react';
import actionCreators from '../../../InstalledComponentsActionCreators';
import Modal from './TableInputMappingModal';

export default React.createClass({
  propTypes: {
    tables: React.PropTypes.object.isRequired,
    mapping: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    otherDestinations: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <Modal
        mode="create"
        mapping={this.props.mapping}
        tables={this.props.tables}
        onChange={this.handleChange}
        onCancel={this.handleCancel}
        onSave={this.handleSave}
        otherDestinations={this.props.otherDestinations}
      />
    );
  },

  handleChange(newMapping) {
    actionCreators.changeEditingMapping(this.props.componentId,
      this.props.configId,
      'input',
      'tables',
      'new-mapping',
      newMapping
    );
  },

  handleCancel() {
    actionCreators.cancelEditingMapping(this.props.componentId,
      this.props.configId,
      'input',
      'tables',
      'new-mapping'
    );
  },

  handleSave() {
    const newTableId = this.props.mapping.get('source');

    return actionCreators.saveEditingMapping(this.props.componentId,
      this.props.configId,
      'input',
      'tables',
      'new-mapping',
      `Add input table ${newTableId}`
    );
  }
});
