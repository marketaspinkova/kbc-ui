import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';
import { parse as parseTable } from '../../../../utils/tableIdParser';

export default createReactClass({
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
