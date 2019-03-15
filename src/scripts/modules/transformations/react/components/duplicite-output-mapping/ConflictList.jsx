import PropTypes from 'prop-types';
import React from 'react';
import ConflictItem from './ConflictItem';
import Immutable from 'immutable';

export default React.createClass({
  propTypes: {
    conflicts: PropTypes.object.isRequired,
    transformations: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    let reordered = Immutable.Map();
    this.props.conflicts.forEach((conflict) => {
      const tableId = conflict.get('destination');
      const transformationId = conflict.get('id');
      if (reordered.has(tableId)) {
        let transformations = reordered.get(tableId);
        transformations = transformations.push(transformationId);
        reordered = reordered.set(tableId, transformations);
      } else {
        reordered = reordered.set(tableId, Immutable.List([transformationId]));
      }
    });

    const tablesWithConflicts = reordered.map((transformations, tableId) => {
      return (
        <ConflictItem
          key={tableId}
          destination={tableId}
          transformations={this.props.transformations}
          conflicts={transformations}
          bucketId={this.props.bucketId}
        />
      );
    }).toArray();

    return (<ul>{tablesWithConflicts}</ul>);
  }
});
