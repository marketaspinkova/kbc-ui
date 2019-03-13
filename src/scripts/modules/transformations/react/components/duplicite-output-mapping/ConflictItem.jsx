import PropTypes from 'prop-types';
import React from 'react';
import StorageTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';

export default React.createClass({
  propTypes: {
    destination: PropTypes.string.isRequired,
    transformations: PropTypes.object.isRequired,
    conflicts: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    return (
      <li>
        <StorageTableLinkEx
          tableId={this.props.destination}
        >
          {this.props.destination}
        </StorageTableLinkEx>
        {' '}used in{' '}
        {this.renderTransformationsList()}
      </li>
    );
  },

  renderTransformationsList() {
    return this.props.conflicts.map((transformationId, index) => {
      const transformationName = this.props.transformations.get(transformationId).get('name');
      return (
        <span key={index}>
          {index > 0 && ', '}
          <ComponentConfigurationRowLink
            componentId="transformation"
            configId={this.props.bucketId}
            rowId={transformationId}
          >
            {transformationName}
          </ComponentConfigurationRowLink>
        </span>
      );
    }).toList();
  }
});
