import React, {PropTypes} from 'react';
import ConflictItem from './ConflictItem';

export default React.createClass({
  propTypes: {
    conflicts: PropTypes.object.isRequired,
    transformations: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired
  },

  render() {
    return (<ul>{this.renderItems()}</ul>);
  },

  renderItems() {
    return this.props.conflicts.map((conflict) => {
      const transformation = this.props.transformations.get(conflict.get('id'));
      return (
        <ConflictItem
          destination={conflict.get('destination')}
          transformationName={transformation.get('name')}
          transformationId={transformation.get('id')}
          bucketId={this.props.bucketId}
        />
      );
    }).toArray();
  }
});
