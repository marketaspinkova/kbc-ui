import React, { PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import Tooltip from '../../../../../react/common/Tooltip';
import StorageActionCreators from '../../../../components/StorageActionCreators';
import AddColumnModal from '../../modals/AddColumnModal';
import DeleteColumnModal from '../../modals/DeleteColumnModal';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired,
    addingColumn: PropTypes.object.isRequired,
    deletingColumn: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      deleteColumnName: '',
      deleteColumnModal: false,
      addColumnModal: false
    };
  },

  render() {
    const addingColumn = this.props.addingColumn.get(this.props.table.get('id'), false);

    return (
      <div>
        <h2>
          {this.canAddColumn() && (
            <div className="kbc-buttons pull-right">
              <Tooltip tooltip="Add column" placement="top">
                <Button onClick={this.openAddColumnModal} disabled={addingColumn}>
                  {addingColumn ? <Loader /> : <i className="fa fa-plus" />}
                </Button>
              </Tooltip>
            </div>
          )}
          Columns
        </h2>

        <Table striped>
          <tbody>
            {this.props.table
              .get('columns')
              .map(this.renderColumn)
              .toArray()}
          </tbody>
        </Table>

        {this.state.addColumnModal && this.renderAddColumnModal()}
        {this.state.deleteColumnModal && this.renderDeleteColumnModal()}
      </div>
    );
  },

  renderColumn(column) {
    return (
      <tr key={column}>
        <td>{column}</td>
        <td>
          {this.isColumnInPrimaryKey(column) && (
            <span className="label label-info" tooltip="Primary key">
              PK
            </span>
          )}
        </td>
        <td className="actions text-right">{this.renderActions(column)}</td>
      </tr>
    );
  },

  renderActions(column) {
    if (!this.canDeleteColumn(column)) {
      return null;
    }

    if (this.isColumnForceDeletable(column)) {
      const deleting = !!this.props.deletingColumn.getIn([this.props.table.get('id'), column]);

      return (
        <Tooltip tooltip="Delete column" placement="top">
          <Button className="btn btn-link" onClick={() => this.openDeleteColumnModal(column)} disabled={deleting}>
            {deleting ? <Loader /> : <i className="fa fa-trash-o" />}
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip tooltip="Column is used in an alias filter or in alias without synchronized columns" placement="top">
        <Button className="btn btn-link" disabled={false}>
          <i className="fa fa-ban" />
        </Button>
      </Tooltip>
    );
  },

  renderAddColumnModal() {
    return (
      <AddColumnModal
        table={this.props.table}
        tables={this.props.tables}
        onSubmit={this.handleAddColumn}
        onHide={this.closeAddColumnModal}
      />
    );
  },

  renderDeleteColumnModal() {
    return (
      <DeleteColumnModal
        column={this.state.deleteColumnName}
        tableAliases={this.props.tableAliases}
        tableLinks={this.props.tableLinks}
        onConfirm={this.handleDeleteColumn}
        onHide={this.closeDeleteColumnModal}
        sapiToken={this.props.sapiToken}
      />
    );
  },

  handleAddColumn(columnName) {
    const tableId = this.props.table.get('id');
    const params = { name: columnName };
    return StorageActionCreators.addTableColumn(tableId, params);
  },

  handleDeleteColumn(columnName, forceDelete) {
    const tableId = this.props.table.get('id');
    const params = { force: forceDelete };
    return StorageActionCreators.deleteTableColumn(tableId, columnName, params);
  },

  isColumnInPrimaryKey(column) {
    return this.props.table.get('primaryKey').find(item => item === column);
  },

  canWriteTable() {
    const bucketId = this.props.table.getIn(['bucket', 'id']);
    const permission = this.props.sapiToken.getIn(['bucketPermissions', bucketId]);

    return ['write', 'manage'].includes(permission);
  },

  canAddColumn() {
    const { table } = this.props;

    if (!this.canWriteTable() || table.getIn(['bucket', 'backend']) === 'redshift') {
      return false;
    }

    return !table.get('isAlias') || !table.get('aliasColumnsAutoSync');
  },

  canDeleteColumn() {
    const { table } = this.props;

    if (!this.canWriteTable()) {
      return false;
    }

    if (table.get('columns').count() < 2) {
      return false;
    }

    if (
      table.get('isAlias') &&
      (table.getIn(['bucket', 'backend']) === 'redshift' || table.get('aliasColumnsAutoSync'))
    ) {
      return false;
    }

    return true;
  },

  isColumnForceDeletable(column) {
    return !this.isColumnUsedInAliasFilter(column) && !this.isColumnUsedInAliasColumns(column);
  },

  isColumnUsedInAliasFilter(column) {
    const foundAliases = [];

    this.props.tables.forEach(table => {
      if (table.get('isAlias') && table.getIn(['sourceTable', 'id']) === this.props.table.get('id')) {
        if (this.props.sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])) {
          if (table.getIn(['aliasFilter', 'column']) === column) {
            foundAliases.push(table);
          }
        }
      }
    });

    return foundAliases.length > 0;
  },

  isColumnUsedInAliasColumns(column) {
    const foundAliases = [];

    this.props.tables.forEach(table => {
      if (table.get('isAlias') && table.getIn(['sourceTable', 'id']) === this.props.table.get('id')) {
        if (this.props.sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])) {
          if (!table.get('aliasColumnsAutoSync') && table.get('columns').find(item => item === column)) {
            foundAliases.push(table);
          }
        }
      }
    });

    return foundAliases.length > 0;
  },

  openAddColumnModal() {
    this.setState({
      addColumnModal: true
    });
  },

  closeAddColumnModal() {
    this.setState({
      addColumnModal: false
    });
  },

  openDeleteColumnModal(column) {
    this.setState({
      deleteColumnName: column,
      deleteColumnModal: true
    });
  },

  closeDeleteColumnModal() {
    this.setState({
      deleteColumnName: '',
      deleteColumnModal: false
    });
  }
});
