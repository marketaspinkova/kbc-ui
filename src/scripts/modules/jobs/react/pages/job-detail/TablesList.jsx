import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { PanelWithDetails } from '@keboola/indigo-ui';

import { timeInWords } from '../../../../../utils/duration';
import TableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

const VISIBLE_TABLES_LIMIT = 10;

export default createReactClass({
  propTypes: {
    tables: PropTypes.object.isRequired,
    allTablesIds: PropTypes.object.isRequired
  },

  render() {
    const tablesCount = this.props.tables.get('tables').count();
    if (tablesCount > 0) {
      if (tablesCount > VISIBLE_TABLES_LIMIT) {
        return this.renderWithPanel();
      } else {
        return (
          <ul className="kbc-break-all kbc-break-word">
            {this.renderSlicedItems(0, tablesCount)}
          </ul>
        );
      }
    }
    return (
      <div className="text-muted">No tables.</div>
    );
  },

  duration(durationSeconds) {
    return timeInWords(Math.round(durationSeconds));
  },

  renderSlicedItems(start, count) {
    return this.props.tables
      .get('tables')
      .sortBy((table) => {
        return -table.get('durationTotalSeconds');
      })
      .toSeq()
      .slice(start, count)
      .map(this.renderListItem)
      .toArray();
  },

  renderListItem(table) {
    return (
      <li key={table.get('id')}>
        <TableLinkEx
          tableId={table.get('id')}>
          {table.get('id')}
          <span className="text-muted">
            {' ' + this.duration(table.get('durationTotalSeconds'))}
          </span>
        </TableLinkEx>
      </li>
    );
  },

  renderWithPanel() {
    const tablesCount = this.props.tables.get('tables').count();
    const headerRows = this.renderSlicedItems(0, VISIBLE_TABLES_LIMIT);
    const panelContentRows = this.renderSlicedItems(VISIBLE_TABLES_LIMIT, tablesCount);
    const labelOpen = tablesCount === 100 ? `More than ${tablesCount - VISIBLE_TABLES_LIMIT} others.` : `Show ${tablesCount - VISIBLE_TABLES_LIMIT} more tables`;
    return (
      <span>
        <ul className="list-no-bottom-margin kbc-break-all kbc-break-word">
          {headerRows}
        </ul>
        <PanelWithDetails
          placement="bottom"
          labelOpen={labelOpen}
          labelCollapse="Show less"
        >
          <ul className="kbc-break-all kbc-break-word">
            {panelContentRows}
          </ul>
        </PanelWithDetails>
      </span>
    );
  }
});
