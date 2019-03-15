import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { InlineEditInput } from '@keboola/indigo-ui';

import TransformationsStore from '../../stores/TransformationsStore';
import ConfigurationRowEditField from '../../../components/react/components/ConfigurationRowEditField';

export default createReactClass({
  propTypes: {
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired
  },

  render() {
    const fallbackValue = TransformationsStore.getTransformation(this.props.configId, this.props.rowId).get('name');

    return (
      <ConfigurationRowEditField
        componentId="transformation"
        configId={this.props.configId}
        rowId={this.props.rowId}
        fieldName="name"
        editElement={InlineEditInput}
        placeholder="Choose a name..."
        tooltipPlacement="bottom"
        fallbackValue={fallbackValue}
      />
    );
  }
});
