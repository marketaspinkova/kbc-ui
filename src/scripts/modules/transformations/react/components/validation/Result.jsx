import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';
import InvalidQuery from './InvalidQuery';
import InvalidInput from './InvalidInput';
import InvalidOutput from './InvalidOutput';
import contactSupport from '../../../../../utils/contactSupport';

export default React.createClass({
  propTypes: {
    bucketId: PropTypes.string.isRequired,
    result: PropTypes.object.isRequired,
    onRedirect: PropTypes.func.isRequired
  },

  render() {
    if (this.props.result.count() > 0) {
      return (
        <Alert bsStyle="danger">
          <h4>Following errors found</h4>
          {this.props.result.map(this.renderResult).toArray()}
          <p>
            Not an error? Please <a onClick={() => contactSupport({ type: 'project' })}>contact us</a>.
          </p>
        </Alert>
      );
    }

    return (
      <Alert bsStyle="success">
        <i className="fa fa-check" /> SQL is valid.
      </Alert>
    );
  },

  renderResult(error, index) {
    const type = error.getIn(['object', 'type']);

    if (type === 'query') {
      return (
        <InvalidQuery
          bucketId={this.props.bucketId}
          key={index}
          transformationId={error.get('transformation')}
          queryNumber={parseInt(error.getIn(['object', 'id']), 10)}
          message={error.get('message')}
          onClick={this.props.onRedirect}
        />
      );
    }

    if (type === 'input') {
      return (
        <InvalidInput
          bucketId={this.props.bucketId}
          key={index}
          transformationId={error.get('transformation')}
          tableId={error.getIn(['object', 'id'])}
          message={error.get('message')}
          onClick={this.props.onRedirect}
        />
      );
    }

    if (['output', 'output_consistency'].includes(type)) {
      return (
        <InvalidOutput
          bucketId={this.props.bucketId}
          key={index}
          transformationId={error.get('transformation')}
          tableId={error.getIn(['object', 'id'])}
          message={error.get('message')}
          onClick={this.props.onRedirect}
        />
      );
    }

    return <p key={index}>{error.get('message')}</p>;
  }
});
