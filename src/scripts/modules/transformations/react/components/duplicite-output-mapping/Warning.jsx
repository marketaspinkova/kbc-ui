import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Alert } from 'react-bootstrap';
import { getConflictsForTransformation } from '../duplicite-output-mapping/detect';
import ConflictList from './ConflictList';
import { ExternalLink } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    transformations: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    const conflicts = getConflictsForTransformation(this.props.transformation, this.props.transformations);
    if (conflicts.size === 0) {
      return null;
    }
    return (
      <Alert bsStyle="warning">
        <h3>Output Warning</h3>
        <p>
          This transformation shares its outputs with other transformations in the same phase.
          The execution order of outputs in a single phase is not guaranteed and may change.
          Please adjust the outputs to avoid data loss or confusion.
        </p>
        <ConflictList
          conflicts={conflicts}
          transformations={this.props.transformations}
          bucketId={this.props.bucketId}
        />
        <p>
          Read more about speeding up the output by using
          {' '}<ExternalLink
            href="https://status.keboola.com/speeding-up-transformation-outputs-in-your-projects">
            parallel unloads
          </ExternalLink>.
        </p>
      </Alert>
    );
  }
});
