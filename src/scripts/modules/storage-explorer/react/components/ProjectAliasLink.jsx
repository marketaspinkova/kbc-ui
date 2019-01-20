import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import ProjectBucketLink from './ProjectBucketLink';

export default React.createClass({
  propTypes: {
    sapiToken: PropTypes.object.isRequired,
    alias: PropTypes.object.isRequired
  },

  render() {
    const projectId = parseInt(this.props.alias.getIn(['project', 'id']), 10);

    if (this.props.sapiToken.getIn(['owner', 'id']) === projectId) {
      return (
        <Link
          to="storage-explorer-table"
          params={{ bucketId: this.props.alias.get('bucketId'), tableName: this.props.alias.get('tableName') }}
        >
          {this.props.alias.get('id')}
        </Link>
      );
    }

    if (this.props.sapiToken.getIn(['admin', 'isOrganizationMember'])) {
      return <ProjectBucketLink bucket={this.props.alias} />;
    }

    return (
      <span>
        {this.props.alias.get(['project', 'name'])} / {this.props.alias.get('id')}
      </span>
    );
  }
});
