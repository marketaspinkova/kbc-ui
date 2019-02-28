import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';
import { Table, Button, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import TableUpdatedByComponentInfo from '../../../../../react/common/TableUpdatedByComponentInfo';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Tooltip from '../../../../../react/common/Tooltip';
import FileSize from '../../../../../react/common/FileSize';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import CreatePrimaryKeyModal from '../../modals/CreatePrimaryKeyModal';
import ProjectAliasLink from '../../components/ProjectAliasLink';
import ExternalProjectTableLink from '../../components/ExternalProjectTableLink';
import AliasFilter from '../../components/TableAliasFilter';
import { createTablePrimaryKey, removeTablePrimaryKey } from '../../../Actions';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    creatingPrimaryKey: PropTypes.bool.isRequired,
    deletingPrimaryKey: PropTypes.bool.isRequired,
    settingAliasFilter: PropTypes.bool.isRequired,
    removingAliasFilter: PropTypes.bool.isRequired,
    canWriteTable: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showCreatePrimaryKeyModal: false,
      showRemovePrimaryKeyModal: false
    };
  },

  render() {
    const table = this.props.table;

    return (
      <div>
        {this.renderDescription()}

        <Row>
          <Table responsive striped className="storage-table-overview">
            <tbody>
              <tr>
                <td>ID</td>
                <td>{table.get('id')}</td>
              </tr>
              <tr>
                <td>Created</td>
                <td>
                  <CreatedWithIcon createdTime={table.get('created')} relative={false} />
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
                  <td>
                    <AliasFilter
                      table={table}
                      canEdit={this.props.canWriteTable}
                      settingAliasFilter={this.props.settingAliasFilter}
                      removingAliasFilter={this.props.removingAliasFilter}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <td>Last import</td>
                <td>
                  {table.get('lastImportDate') ? (
                    <CreatedWithIcon createdTime={table.get('lastImportDate')} relative={false} />
                  ) : (
                    'Not yet imported'
                  )}
                </td>
              </tr>
              <tr>
                <td>Last change</td>
                <td>
                  {table.get('lastChangeDate') ? (
                    <CreatedWithIcon createdTime={table.get('lastChangeDate')} relative={false} />
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td>Last updated by</td>
                <td><TableUpdatedByComponentInfo table={table}/></td>
              </tr>
              <tr>
                <td>Rows count</td>
                <td>
                  {table.get('rowsCount') || 'N/A'}
                </td>
              </tr>
              <tr>
                <td>Data size</td>
                <td>
                  <FileSize size={table.get('dataSizeBytes')} />
                </td>
              </tr>
            </tbody>
          </Table>
        </Row>

        {this.renderCreatePrimaryKeyModal()}
        {this.renderRemovePrimaryKeyModal()}
      </div>
    );
  },

  renderDescription() {
    return (
      <MetadataEditField
        objectType="table"
        metadataKey="KBC.description"
        placeholder="Describe table"
        objectId={this.props.table.get('id')}
        editElement={InlineEditArea}
      />
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
      if (this.props.sapiToken.getIn(['admin', 'isOrganizationMember'])) {
        return (
          <ExternalProjectTableLink
            table={table.get('sourceTable')}
            urlTemplates={this.props.urlTemplates}
          />
        );
      }
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

        {this.props.tableLinks.map(alias => (
          <div key={alias.get('id')}>
            <ProjectAliasLink
              sapiToken={this.props.sapiToken}
              urlTemplates={this.props.urlTemplates}
              alias={alias}
            />
          </div>
        ))}
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
        show={this.state.showRemovePrimaryKeyModal}
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
      showRemovePrimaryKeyModal: true
    });
  },

  closeRemovePrimaryKeyModal() {
    this.setState({
      showRemovePrimaryKeyModal: false
    });
  }
});
