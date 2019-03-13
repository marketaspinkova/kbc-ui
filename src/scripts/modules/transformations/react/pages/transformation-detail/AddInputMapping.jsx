import PropTypes from 'prop-types';
import React from 'react';
import InputMappingModal from '../../modals/InputMapping';
import actionCreators from '../../../ActionCreators';

export default React.createClass({
  propTypes: {
    tables: PropTypes.object.isRequired,
    transformation: PropTypes.object.isRequired,
    bucket: PropTypes.object.isRequired,
    mapping: PropTypes.object.isRequired,
    otherDestinations: PropTypes.object.isRequired
  },

  render() {
    return (
      <InputMappingModal
        mode="create"
        mapping={this.props.mapping}
        tables={this.props.tables}
        backend={this.props.transformation.get('backend')}
        type={this.props.transformation.get('type')}
        onChange={this.handleChange}
        onCancel={this.handleCancel}
        onSave={this.handleSave}
        otherDestinations={this.props.otherDestinations}
      />
    );
  },

  handleChange(newMapping) {
    actionCreators.updateTransformationEditingField(this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'new-input-mapping',
      newMapping
    );
  },

  handleCancel() {
    actionCreators.cancelTransformationEditingField(this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'new-input-mapping'
    );
  },

  handleSave() {
    // returns promise
    return actionCreators.saveTransformationMapping(this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'input',
      'new-input-mapping'
    );
  }

});
