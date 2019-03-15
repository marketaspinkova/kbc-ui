import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import InlineEditTextArea from '../../../../react/common/InlineEditArea';
import ComponentEditField from './ComponentEditField';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    placeholder: PropTypes.string
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
