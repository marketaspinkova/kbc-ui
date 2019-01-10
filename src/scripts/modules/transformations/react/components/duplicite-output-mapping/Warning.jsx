import React, {PropTypes} from 'react';
import { Alert } from 'react-bootstrap';
import getConflicts from '../duplicite-output-mapping/detect';
import ConflictList from './ConflictList';

export default React.createClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    transformations: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    const conflicts = getConflicts(this.props.transformation, this.props.transformations);
    if (conflicts.size === 0) {
      return null;
    }
    return (
      <Alert bsStyle="warning">
        <h3>Output Mapping Warning</h3>
        <p>
          Output mapping of this transformation contains some duplicities with transformations in the same stage. Execution order of all output mappings
          in a single stage is not guaranteed and may change. Please adjust the output mappings to avoid data loss or confusion.
        </p>
        <ConflictList
          conflicts={conflicts}
          transformations={this.props.transformations}
          bucketId={this.props.bucketId}
        />
      </Alert>
    );
  }
});
