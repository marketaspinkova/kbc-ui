import React from 'react';
import ColumnRow from './ColumnRow';
import Hint from '../../../../../react/common/Hint';
import Tooltip from '../../../../../react/common/Tooltip';

export default React.createClass({
  propTypes: {
    columns: React.PropTypes.object.isRequired,
    filterColumnFn: React.PropTypes.func.isRequired,
    onToggleHideIgnored: React.PropTypes.func.isRequired,
    editButtons: React.PropTypes.object.isRequired,
    disabledColumnFields: React.PropTypes.array.isRequired,
    onSetAllColumnsNull: React.PropTypes.func.isRequired,
    editingColumns: React.PropTypes.object,
    editColumnFn: React.PropTypes.func,
    dataTypes: React.PropTypes.array,
    isSaving: React.PropTypes.bool,
    dataPreview: React.PropTypes.object,
    columnsValidation: React.PropTypes.object,
    setAllColumnsType: React.PropTypes.object,
    setAllColumnsName: React.PropTypes.object
  },

  render() {
    return (
      <div style={{ overflow: 'scroll' }}>
        <table className="table table-striped kbc-table-editor">
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
              {this._renderNullableHeader()}
              {this._renderDefaultHeader()}
              <th>{this.props.editButtons}</th>
            </tr>
          </thead>
          <tbody>{this._renderRows()}</tbody>
        </table>
      </div>
    );
  },

  _renderRows() {
    const columns = this.props.columns.filter(column => {
      let fn = column;
      if (this.props.editingColumns) {
        fn = this.props.editingColumns.get(column.get('name'));
      }
      return this.props.filterColumnFn(fn);
    });

    if (!columns.count()) {
      return (
        <tr>
          <td colSpan="6">
            <div className="text-center">No Columns.</div>
          </td>
        </tr>
      );
    }

    return columns.map((column, index) => {
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
          isSaving={this.props.isSaving}
          column={column}
          editingColumn={editingColumn}
          dataTypes={this.props.dataTypes}
          editColumnFn={this.props.editColumnFn}
          dataPreview={this.props.dataPreview}
          disabledFields={this.props.disabledColumnFields}
        />
      );
    });
  },

  _renderNullableHeader() {
    if (this.props.disabledColumnFields.includes('nullable')) {
      return <th />;
    } else {
      return (
        <th>
          <span>Null</span>{' '}
          <Hint title="Nullable Column">
            {'Empty strings in the source data will be replaced with SQL '}
            <code>NULL</code>.
          </Hint>
          {this.props.editingColumns && this._createCheckbox()}
        </th>
      );
    }
  },

  _renderDefaultHeader() {
    if (this.props.disabledColumnFields.includes('default')) {
      return <th />;
    } else {
      return <th>Default Value</th>;
    }
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
