import React from 'react';
import { Map } from 'immutable';
import { Table } from 'react-bootstrap';
import ColumnRow from './ColumnRow';
import ComponentEmptyState from '../../../../components/react/components/ComponentEmptyState';

export default React.createClass({
  propTypes: {
    table: React.PropTypes.object.isRequired,
    columnsTypes: React.PropTypes.object.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    dataPreview: React.PropTypes.object,
    editingData: React.PropTypes.object,
    onChange: React.PropTypes.func,
    hideIgnored: React.PropTypes.bool
  },

  render() {
    const isEditing = !!this.props.editingData;

    const columns = this.props.table.get('columns').filterNot(c => {
      const isEditingIgnored = (this.props.editingData && this.props.editingData.getIn([c, 'type'])) === 'IGNORE';
      if (isEditing) {
        return this.props.hideIgnored && isEditingIgnored;
      }

      const isStaticIgnored = !!!this.props.columnsTypes.getIn([c, 'type']);
      return this.props.hideIgnored && isStaticIgnored;
    });

    const rows = columns.map((column, index) => {
      return (
        <ColumnRow
          key={index}
          column={column}
          tdeType={this.props.columnsTypes.get(column, Map())}
          editing={this.props.editingData && this.props.editingData.get(column)}
          isSaving={this.props.isSaving}
          dataPreview={this.props.dataPreview}
          onChange={data => {
            const newData = this.props.editingData.set(column, data);
            this.props.onChange(newData);
          }}
        />
      );
    });

    if (!rows.count()) {
      return <ComponentEmptyState>No Columns.</ComponentEmptyState>;
    }

    return (
      <Table striped responsive className="kbc-table-editor">
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Column</th>
            <th style={{ width: '50%' }}>TDE Data Type</th>
            <th style={{ width: '15%' }}>Preview</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
});
