import PropTypes from 'prop-types';
import React from 'react';
import { InlineEditInput } from '@keboola/indigo-ui';
import ComponentEditField from './ComponentEditField';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired
  },

  render() {
    return (
      <ComponentEditField
        componentId={this.props.componentId}
        configId={this.props.configId}
        fieldName="name"
        editElement={InlineEditInput}
        placeholder="My Configuration"
        tooltipPlacement="bottom"
      />
    );
  }
});
