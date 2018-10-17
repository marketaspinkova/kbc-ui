import React from 'react';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    transformation: React.PropTypes.object.isRequired,
    queryNumber: React.PropTypes.number.isRequired,
    message: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func
  },

  render() {
    return (
      <p>
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.props.transformation.get('id')}
          query={{ highlightQueryNumber: this.props.queryNumber }}
          onClick={this.props.onClick}
        >
          Transformation {this.props.transformation.get('name')}, query #{this.props.queryNumber}
        </ComponentConfigurationRowLink>
        <br />
        {this.props.message}
      </p>
    );
  }
});
