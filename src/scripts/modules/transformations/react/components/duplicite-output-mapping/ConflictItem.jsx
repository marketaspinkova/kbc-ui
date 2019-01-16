import React, {PropTypes} from 'react';
import StorageTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';

export default React.createClass({
  propTypes: {
    destination: PropTypes.string.isRequired,
    transformationName: PropTypes.string.isRequired,
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    return (
      <li>
        Transformation
        {' '}
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.props.transformationId}
        >
          {this.props.transformationName}
        </ComponentConfigurationRowLink>
        {' '}
        to table
        {' '}
        <StorageTableLinkEx
          tableId={this.props.destination}
        >
          {this.props.destination}
        </StorageTableLinkEx>
      </li>
    );
  }
});
