import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import TableDescriptionEditor from './TableDescriptionEditor';

export default createReactClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tableExists: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool
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

    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
        <TableDescriptionEditor table={this.props.table} />
      </div>
    );
  }
});
