import React from 'react';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    transformation: React.PropTypes.object.isRequired,
    tableId: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <p>
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.props.transformation.get('id')}
        >
          Transformation {this.props.transformation.get('name')}, output mapping of {this.props.tableId}
        </ComponentConfigurationRowLink>
        <br />
        {this.props.message}
      </p>
    );
  }
});
