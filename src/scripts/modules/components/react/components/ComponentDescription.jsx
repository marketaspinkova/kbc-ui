import React from 'react';
import InlineEditTextArea from '../../../../react/common/InlineEditArea';
import ComponentEditField from './ComponentEditField';

export default React.createClass({
  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return { placeholder: 'Description' };
  },

  render() {
    return (
      <ComponentEditField
        componentId={this.props.componentId}
        configId={this.props.configId}
        fieldName="description"
        editElement={InlineEditTextArea}
        placeholder={this.props.placeholder} />
    );
  }
});
