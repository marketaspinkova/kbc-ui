import React from 'react';
import InvalidQuery from './InvalidQuery';
import InvalidInput from './InvalidInput';
import InvalidOutput from './InvalidOutput';

export default React.createClass({
  propTypes: {
    error: React.PropTypes.object.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    transformation: React.PropTypes.object.isRequired
  },

  render() {
    const errorType = this.props.error.getIn(['object', 'type']);

    if (errorType === 'query') {
      return (
        <InvalidQuery
          bucketId={this.props.bucketId}
          transformation={this.props.transformation}
          queryNumber={parseInt(this.props.error.getIn(['object', 'id']), 10)}
          message={this.props.error.get('message')}
        />
      );
    }

    if (errorType === 'input') {
      return (
        <InvalidInput
          bucketId={this.props.bucketId}
          transformation={this.props.transformation}
          tableId={this.props.error.getIn(['object', 'id'])}
          message={this.props.error.get('message')}
        />
      );
    }

    if (['output', 'output_consistency'].includes(errorType)) {
      return (
        <InvalidOutput
          bucketId={this.props.bucketId}
          transformation={this.props.transformation}
          tableId={this.props.error.getIn(['object', 'id'])}
          message={this.props.error.get('message')}
        />
      );
    }

    return <p>{this.props.error.get('message')}</p>;
  }
});
