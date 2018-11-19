import React from 'react';
import InlineEditTextInput from '../../../../react/common/InlineEditTextInput';
import ComponentEditField from './ComponentEditField';

export default React.createClass({
  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <ComponentEditField
        componentId={this.props.componentId}
        configId={this.props.configId}
        fieldName="name"
        editElement={InlineEditTextInput}
        placeholder="My Configuration"
        tooltipPlacement="bottom"
      />
    );
  }
});
