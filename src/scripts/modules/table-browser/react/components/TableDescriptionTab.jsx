import React, {PropTypes} from 'react';

import EmptyState from '../../../components/react/components/ComponentEmptyState';
import TableDescriptionEditor from './TableDescriptionEditor';

export default React.createClass({

  propTypes: {
    isLoading: PropTypes.bool,
    tableId: PropTypes.string.isRequired,
    tableExists: PropTypes.bool.isRequired
  },

  render() {
    if (!this.props.tableExists) {
      let msg = 'Table does not exist.';
      if (this.props.isLoading) {
        msg = 'Loading...';
      }
      return (
        <EmptyState key="emptytable">
          {msg}
        </EmptyState>
      );
    }
    const tableId = this.props.tableId;
    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
        <TableDescriptionEditor tableId={tableId}/>
      </div>
    );
  }
});
