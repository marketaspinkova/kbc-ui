import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Table } from 'react-bootstrap';
import ColumnRow from './ColumnRow';
import Tooltip from '../../../../../react/common/Tooltip';

export default createReactClass({
  propTypes: {
    columns: PropTypes.object.isRequired,
    filterColumnFn: PropTypes.func.isRequired,
    onToggleHideIgnored: PropTypes.func.isRequired,
    disabledColumnFields: PropTypes.array.isRequired,
    onSetAllColumnsNull: PropTypes.func.isRequired,
    editingColumns: PropTypes.object,
    editColumnFn: PropTypes.func,
    dataTypes: PropTypes.array,
    isSaving: PropTypes.bool,
    dataPreview: PropTypes.object,
    columnsValidation: PropTypes.object,
    setAllColumnsType: PropTypes.object,
    setAllColumnsName: PropTypes.object
  },

  render() {
    return (
      <Table responsive striped className="kbc-table-editor">
        <thead>
          <tr>
            <th>Column</th>
            <th>
              Database Column Name
              {this.props.editingColumns && this.props.setAllColumnsName}
            </th>
            <th>
              Data Type
              <div style={{ margin: 0 }} className="checkbox">
                <label className="">
                  <input type="checkbox" label="Hide IGNORED" onChange={this.props.onToggleHideIgnored} />
                  {' Hide Ignored'}
                </label>
              </div>
              {this.props.editingColumns && this.props.setAllColumnsType}
            </th>
            {this.renderNullableHeader()}
            {this.renderDefaultHeader()}
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </Table>
    );
  },

  renderRows() {
    const columns = this.props.columns.filter(column => {
      let fn = column;
      if (this.props.editingColumns) {
        fn = this.props.editingColumns.get(column.get('name'));
      }
      return this.props.filterColumnFn(fn);
    });

    const rows = columns.map((column, index) => {
      const cname = column.get('name');
      let editingColumn = null;
      let isValid = true;
      if (this.props.editingColumns) {
        editingColumn = this.props.editingColumns.get(cname);
        isValid = this.props.columnsValidation.get(cname, true);
      }

      return (
        <ColumnRow
          key={index}
          isValid={isValid}
          column={column}
          editingColumn={editingColumn}
          isSaving={this.props.isSaving}
          dataTypes={this.props.dataTypes}
          editColumnFn={this.props.editColumnFn}
          dataPreview={this.props.dataPreview}
          disabledFields={this.props.disabledColumnFields}
        />
      );
    });

    if (!rows.count()) {
      return (
        <tr>
          <td colSpan="6">
            <div className="text-center">No Columns.</div>
          </td>
        </tr>
      );
    }

    return rows;
  },

  renderNullableHeader() {
    if (this.props.disabledColumnFields.includes('nullable')) {
      return <th />;
    }

    return (
      <th>
        <span>Null </span>
        {this.props.editingColumns && this._createCheckbox()}
      </th>
    );
  },

  renderDefaultHeader() {
    if (this.props.disabledColumnFields.includes('default')) {
      return <th />;
    }

    return <th>Default Value</th>;
  },

  _createCheckbox() {
    const allColumnsIgnored = this.props.editingColumns.reduce(
      (memo, column) => memo && column.get('type') === 'IGNORE',
      true
    );

    return (
      <div className="text-center checkbox">
        <Tooltip tooltip="Set to all columns">
          <input disabled={allColumnsIgnored} type="checkbox" onChange={this.props.onSetAllColumnsNull} />
        </Tooltip>
      </div>
    );
  }
});
