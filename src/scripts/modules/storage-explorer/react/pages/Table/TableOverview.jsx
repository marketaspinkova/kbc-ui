import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Table, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Tooltip from '../../../../../react/common/Tooltip';
import Hint from '../../../../../react/common/Hint';
import FileSize from '../../../../../react/common/FileSize';
import { createTablePrimaryKey, removeTablePrimaryKey } from '../../../Actions';

import ConfirmModal from '../../../../../react/common/ConfirmModal';
import CreatePrimaryKeyModal from '../../modals/CreatePrimaryKeyModal';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired,
    creatingPrimaryKey: PropTypes.bool.isRequired,
    deletingPrimaryKey: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      removePrimaryKeyModal: false
      showCreatePrimaryKeyModal: false,
    };
  },

  render() {
    const table = this.props.table;

    return (
      <div>
        <Table responsive striped>
          <tbody>
            <tr>
              <td>ID</td>
              <td>{table.get('id')}</td>
            </tr>
            <tr>
              <td>Created</td>
              <td>
                <CreatedWithIcon createdTime={table.get('created')} />
              </td>
            </tr>
            <tr>
              <td>Primary key</td>
              <td>
                {this.renderPrimaryKeyInfo(table)}{' '}
                {!table.get('isAlias') && table.get('primaryKey').count() > 0 && (
                  <Tooltip tooltip="Remove table primary key" placement="top">
                    <Button
                      bsSize="small"
                      onClick={this.openRemovePrimaryKeyModal}
                      disabled={this.props.deletingPrimaryKey}
                    >
                      {this.props.deletingPrimaryKey ? <Loader /> : <i className="fa fa-trash-o" />}
                    </Button>
                  </Tooltip>
                )}
                {!table.get('isAlias') && !table.get('primaryKey').count() > 0 && (
                  <Tooltip tooltip="Create table primary key" placement="top">
                    <Button
                      bsSize="small"
                      onClick={this.openCreatePrimaryKeyModal}
                      disabled={this.props.creatingPrimaryKey}
                    >
                      {this.props.creatingPrimaryKey ? <Loader /> : <i className="fa fa-pencil-square-o" />}
                    </Button>
                  </Tooltip>
                )}
              </td>
            </tr>
            {table.get('sourceTable') && (
              <tr>
                <td>Source table</td>
                <td>{this.renderSourceTable()}</td>
              </tr>
            )}
            {(this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0) && (
              <tr>
                <td>Table aliases</td>
                <td>{this.renderTableAliases()}</td>
              </tr>
            )}
            {table.get('isAlias') && !table.get('selectSql') && (
              <tr>
                <td>Alias filter</td>
                <td />
              </tr>
            )}
            <tr>
              <td>Last import</td>
              <td>
                {table.get('lastImportDate') ? (
                  <CreatedWithIcon createdTime={table.get('lastImportDate')} />
                ) : (
                  'Not yet imported'
                )}
              </td>
            </tr>
            <tr>
              <td>Last change</td>
              <td>
                <CreatedWithIcon createdTime={table.get('lastChangeDate')} />
              </td>
            </tr>
            <tr>
              <td>Rows count</td>
              <td>
                {table.get('rowsCount')}{' '}
                {table.getIn(['bucket', 'backend']) === 'mysql' && (
                  <Hint title="Rows count">Number of rows is only an estimate.</Hint>
                )}
              </td>
            </tr>
            <tr>
              <td>Data size</td>
              <td>
                <FileSize size={table.get('dataSizeBytes')} />{' '}
                {table.getIn(['bucket', 'backend']) === 'mysql' && (
                  <Hint title="Data size">Data size is only an estimate.</Hint>
                )}
              </td>
            </tr>
          </tbody>
        </Table>

        {this.state.removePrimaryKeyModal && this.renderRemovePrimaryKeyModal()}
        {this.renderCreatePrimaryKeyModal()}
      </div>
    );
  },

  renderPrimaryKeyInfo(table) {
    if (!table.get('primaryKey').count()) {
      return 'Not set';
    }

    return table.get('primaryKey').join(', ');
  },

  renderSourceTable() {
    const { sapiToken, table } = this.props;

    if (sapiToken.getIn(['owner', 'id']) !== table.getIn(['sourceTable', 'project', 'id'])) {
      return (
        <span>
          {table.getIn(['sourceTable', 'project', 'name'])} / {table.getIn(['sourceTable', 'id'])}
        </span>
      );
    }

    const sourceTable = this.props.tables.find(item => {
      return item.get('id') === table.getIn(['sourceTable', 'id']);
    });

    return (
      <Link
        to="storage-explorer-table"
        params={{
          bucketId: sourceTable.getIn(['bucket', 'id']),
          tableName: sourceTable.get('name')
        }}
      >
        {sourceTable.get('id')}
      </Link>
    );
  },

  renderTableAliases() {
    return (
      <span>
        {this.props.tableAliases.map(alias => (
          <div key={alias.get('id')}>
            <Link
              to="storage-explorer-table"
              params={{ bucketId: alias.getIn(['bucket', 'id']), tableName: alias.get('name') }}
            >
              {alias.get('id')}
            </Link>
          </div>
        ))}

        {this.props.tableLinks.map(alias => {
          const ownerId = this.props.sapiToken.getIn(['owner', 'id']);
          const isOrganizationMember = this.props.sapiToken.getIn(['admin', 'isOrganizationMember']);
          const project = alias.get('project');

          return (
            <div key={alias.get('id')}>
              {ownerId === project.get('id') && (
                <Link
                  to="storage-explorer-table"
                  params={{ bucketId: alias.get('bucketId'), tableName: alias.get('tableName') }}
                >
                  {alias.get('id')}
                </Link>
              )}

              {ownerId !== project.get('id') && isOrganizationMember && (
                <span>
                  {project.get('name')} / {alias.get('id')}
                </span>
              )}

              {ownerId !== project.get('id') &&
                isOrganizationMember &&
                <a href={`/admin/projects/${project.get('id')}`}>{project.get('name')}</a> /
                (
                  <a href={`/admin/projects/${project.get('id')}/storage#/buckets/${alias.get('id')}`}>
                    {alias.get('id')}
                  </a>
                )}
            </div>
          );
        })}
      </span>
    );
  },

  renderCreatePrimaryKeyModal() {
    return (
      <CreatePrimaryKeyModal
        show={this.state.showCreatePrimaryKeyModal}
        columns={this.props.table.get('columns')}
        backend={this.props.table.getIn(['bucket', 'backend'])}
        onSubmit={this.handleCreatePrimaryKey}
        onHide={this.closeCreatePrimaryKeyModal}
      />
    );
  },

  renderRemovePrimaryKeyModal() {
    return (
      <ConfirmModal
        show={true}
        title="Remove primary key"
        buttonType="danger"
        buttonLabel="Remove"
        text={<p>Do you really want to remove table primary key?</p>}
        onConfirm={this.handleRemovePrimaryKey}
        onHide={this.closeRemovePrimaryKeyModal}
      />
    );
  },

  handleCreatePrimaryKey(primaryKeys) {
    const tableId = this.props.table.get('id');
    const params = {
      columns: primaryKeys
    };

    return createTablePrimaryKey(tableId, params);
  },

  handleRemovePrimaryKey() {
    const tableId = this.props.table.get('id');

    return removeTablePrimaryKey(tableId);
  },

  openCreatePrimaryKeyModal() {
    this.setState({
      showCreatePrimaryKeyModal: true
    });
  },

  closeCreatePrimaryKeyModal() {
    this.setState({
      showCreatePrimaryKeyModal: false
    });
  },

  openRemovePrimaryKeyModal() {
    this.setState({
      removePrimaryKeyModal: true
    });
  },

  closeRemovePrimaryKeyModal() {
    this.setState({
      removePrimaryKeyModal: false
    });
  }
});
