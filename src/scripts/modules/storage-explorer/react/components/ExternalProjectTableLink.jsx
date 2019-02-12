import React, { PropTypes } from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';
import { parse as parseTable } from '../../../../utils/tableIdParser';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  render() {
    const { table, urlTemplates } = this.props;
    const tableId = table.get('id');
    const projectId = table.getIn(['project', 'id']);
    const projectName = table.getIn(['project', 'name']);

    const parsedTable = parseTable(tableId);

    return (
      <span>
        <ExternalLink
          href={_.template(urlTemplates.get('project'))({ projectId })}
        >
          {projectName}
        </ExternalLink>
        {' / '}
        <ExternalLink
          href={
            _.template(urlTemplates.get('project'))({ projectId })
              + `/storage-explorer/${parsedTable.parts.stage}.${parsedTable.parts.bucket}/${parsedTable.parts.table}`
          }
        >
          {tableId}
        </ExternalLink>
      </span>
    );
  }
});
