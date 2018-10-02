import React from 'react';
import TransformationsStore from '../../stores/TransformationsStore';
import ConfigurationRowEditField from '../../../components/react/components/ConfigurationRowEditField';
import InlineEditTextInput from '../../../../react/common/InlineEditTextInput';

module.exports = React.createClass({
  displayName: 'TransformationNameEditField',

  propTypes: {
    configId: React.PropTypes.string.isRequired,
    rowId: React.PropTypes.string.isRequired
  },

  render: function() {
    const fallbackValue = TransformationsStore.getTransformation(this.props.configId, this.props.rowId).get('name');
    return (
      <ConfigurationRowEditField
        componentId="transformation"
        configId={this.props.configId}
        rowId={this.props.rowId}
        fieldName="name"
        editElement={InlineEditTextInput}
        placeholder="Choose a name..."
        tooltipPlacement="bottom"
        fallbackValue={fallbackValue}
      />
    );
  }
});
