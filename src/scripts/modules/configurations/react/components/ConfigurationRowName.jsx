import React from 'react';
import { InlineEditInput } from '@keboola/indigo-ui';
import ConfigurationRowEditField from '../../../components/react/components/ConfigurationRowEditField';

export default React.createClass({
  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    rowId: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      placeholder: 'My Configuration'
    };
  },

  render() {
    return (
      <ConfigurationRowEditField
        componentId={this.props.componentId}
        configId={this.props.configId}
        rowId={this.props.rowId}
        fieldName="name"
        editElement={InlineEditInput}
        placeholder={this.props.placeholder}
        tooltipPlacement="bottom"
      />
    );
  }
});
