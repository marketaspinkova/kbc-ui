import PropTypes from 'prop-types';
import React from 'react';
import InlineEditTextArea from '../../../../react/common/InlineEditArea';
import ConfigurationRowEditField from '../../../components/react/components/ConfigurationRowEditField';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired,
    placeholder: PropTypes.string
  },
  getDefaultProps: function() {
    return {
      placeholder: 'Description'
    };
  },
  render: function() {
    return (
      <ConfigurationRowEditField
        componentId={this.props.componentId}
        configId={this.props.configId}
        rowId={this.props.rowId}
        fieldName="description"
        editElement={InlineEditTextArea}
        placeholder={this.props.placeholder}
        tooltipPlacement="bottom"
      />
    );
  }
});
