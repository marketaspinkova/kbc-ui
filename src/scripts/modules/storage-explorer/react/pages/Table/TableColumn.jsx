import React, { PropTypes } from 'react';
import Promise from 'bluebird';
import { Table, Button } from 'react-bootstrap';
import Tooltip from '../../../../../react/common/Tooltip';

import DeleteColumnModal from '../../modals/DeleteColumnModal';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      deleteColumnName: '',
      deleteColumnModal: false
    };
  },

  render() {
    return (
      <div>
        <h2>Columns</h2>

        <Table striped>
          <tbody>
            {this.props.table
              .get('columns')
              .map(this.renderColumn)
              .toArray()}
          </tbody>
        </Table>

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
        <td className="actions">{this.renderActions(column)}</td>
      </tr>
    );
  },

  renderActions(column) {
    if (!this.canDeleteColumn(column)) {
      return null;
    }

    if (this.isColumnForceDeletable(column)) {
      return (
        <Tooltip tooltip="Delete column" placement="top">
          <Button className="btn btn-link" onClick={() => this.openDeleteColumnModal(column)}>
            <i className="fa fa-trash-o" />
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

  renderDeleteColumnModal() {
    return (
      <DeleteColumnModal
        column={this.state.deleteColumnName}
        tableAliases={this.props.tableAliases}
        tableLinks={this.props.tableLinks}
        deleting={false}
        onConfirm={this.handleDeleteColumn}
        onHide={this.closeDeleteColumnModal}
        sapiToken={this.props.sapiToken}
      />
    );
  },

  handleDeleteColumn() {
    return Promise.resolve();
  },

  isColumnInPrimaryKey(column) {
    return this.props.table.get('primaryKey').find(item => item === column);
  },

  canDeleteColumn() {
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
