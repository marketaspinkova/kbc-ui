import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { InlineEditInput } from '@keboola/indigo-ui';
import ConfigurationRowEditField from '../../../components/react/components/ConfigurationRowEditField';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired,
    placeholder: PropTypes.string
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
