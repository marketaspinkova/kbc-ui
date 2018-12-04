import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Hint from '../../../../../react/common/Hint';
import FileSize from '../../../../../react/common/FileSize';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired
  },

  render() {
    const table = this.props.table;

    return (
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
            <td>{this.renderPrimaryKeyInfo(table)}</td>
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
    );
  },

  renderPrimaryKeyInfo(table) {
    if (!table.get('primaryKey', List()).count()) {
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
              {isOrganizationMember && ownerId === project.get('id') ? (
                <a href={`/admin/projects/${project.get('id')}`}>{project.get('name')}</a> /
                (
                  <a href={`/admin/projects/${project.get('id')}/storage#/buckets/${alias.get('id')}`}>
                    {alias.get('id')}
                  </a>
                )
              ) : (
                <span>
                  {project.get('name')} / {alias.get('id')}
                </span>
              )}
            </div>
          );
        })}
      </span>
    );
  }
});
