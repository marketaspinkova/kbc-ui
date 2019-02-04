import React, {PropTypes} from 'react';
import { Alert } from 'react-bootstrap';
import { getConflictsForTransformation } from '../duplicite-output-mapping/detect';
import ConflictList from './ConflictList';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
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
          This transformation contains some duplicate outputs with other transformations in the same phase.
          Execution order of outputs in a single phase is not guaranteed and may change.
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
            href="http://status.keboola.com/speeding-up-transformation-output-mappings-in-your-projects">
            parallel unloads
          </ExternalLink>.
        </p>
      </Alert>
    );
  }
});
