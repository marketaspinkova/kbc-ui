import React, { PropTypes } from 'react';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired
  },

  render() {
    const tableId = this.props.table.get('id');
    const projectId = this.props.table.getIn(['project', 'id']);
    const projectName = this.props.table.getIn(['project', 'name']);

    return (
      <span>
        <ExternalLink href={`/admin/projects/${projectId}`}>{projectName}</ExternalLink>
        {' / '}
        <ExternalLink href={`/admin/projects/${projectId}/storage#/tables/${tableId}`}>{tableId}</ExternalLink>
      </span>
    );
  }
});
