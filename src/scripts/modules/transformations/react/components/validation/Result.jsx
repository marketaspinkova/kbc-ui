import React from 'react';
import InvalidQuery from './InvalidQuery';
import InvalidInput from './InvalidInput';
import InvalidOutput from './InvalidOutput';

export default React.createClass({
  propTypes: {
    error: React.PropTypes.object.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    onRedirect: React.PropTypes.func
  },

  render() {
    const { error, bucketId, onRedirect } = this.props;
    const type = this.props.error.getIn(['object', 'type']);

    if (type === 'query') {
      return (
        <InvalidQuery
          bucketId={bucketId}
          transformationId={error.get('transformation')}
          queryNumber={parseInt(error.getIn(['object', 'id']), 10)}
          message={error.get('message')}
          onClick={onRedirect}
        />
      );
    }

    if (type === 'input') {
      return (
        <InvalidInput
          bucketId={bucketId}
          transformationId={error.get('transformation')}
          tableId={error.getIn(['object', 'id'])}
          message={error.get('message')}
          onClick={onRedirect}
        />
      );
    }

    if (['output', 'output_consistency'].includes(type)) {
      return (
        <InvalidOutput
          bucketId={bucketId}
          transformationId={error.get('transformation')}
          tableId={error.getIn(['object', 'id'])}
          message={error.get('message')}
          onClick={onRedirect}
        />
      );
    }

    return <p>{error.get('message')}</p>;
  }
});
