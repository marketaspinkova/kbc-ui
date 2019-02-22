import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { Table, ButtonToolbar, Button, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import FileSize from '../../../../../react/common/FileSize';

import CreateTableModal from '../../modals/CreateTableModal';
import CreateAliasTableModal from '../../modals/CreateAliasTableModal';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    onCreateTableFromCsv: PropTypes.func.isRequired,
    onCreateTableFromString: PropTypes.func.isRequired,
    onCreateAliasTable: PropTypes.func.isRequired,
    isCreatingTable: PropTypes.bool.isRequired,
    isCreatingAliasTable: PropTypes.bool.isRequired,
    uploadingProgress: PropTypes.number.isRequired
  },

  getInitialState() {
    return {
      openCreateTableModal: false,
      openCreateAliasTableModal: false
    };
  },

  render() {
    const creatingTable = this.props.isCreatingTable || this.props.uploadingProgress > 0;

    return (
      <div>
        <h2 className="clearfix">
          <div className="kbc-buttons pull-right">
            <ButtonToolbar>
              {this.canWriteBucket() && (
                <Button bsStyle="success" onClick={this.openCreateTableModal}>
                  {creatingTable ? (
                    <span>
                      <Loader /> Creating table...
                    </span>
                  ) : (
                    <span>Create table</span>
                  )}
                </Button>
              )}
              {this.canCreateAliasTable() && (
                <Button
                  bsStyle="success"
                  onClick={this.openCreateAliasTableModal}
                  disabled={this.props.isCreatingAliasTable}
                >
                  Create table alias
                </Button>
              )}
            </ButtonToolbar>
          </div>
          Tables
        </h2>

        {this.props.tables.count() > 0 ? (
          <Row>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rows count</th>
                  <th>Data size</th>
                  <th>Created</th>
                  <th>Last change</th>
                </tr>
              </thead>
              <tbody>
                {this.props.tables
                  .sortBy(table => table.get('name').toLowerCase())
                  .map(this.renderTableRow)
                  .toArray()}
              </tbody>
            </Table>
          </Row>
        ) : (
          <p>No tables.</p>
        )}

        {this.renderCreateTableModal()}
        {this.canCreateAliasTable() && this.renderCreateAliasTableModal()}
      </div>
    );
  },

  renderTableRow(table) {
    return (
      <tr key={table.get('id')}>
        <td>
          <Link
            to="storage-explorer-table"
            params={{ bucketId: this.props.bucket.get('id'), tableName: table.get('name') }}
            className={classnames({ 'is-table-alias': table.get('isAlias', false) })}
          >
            {table.get('name')}
          </Link>
        </td>
        <td>{table.get('rowsCount') || 'N/A'}</td>
        <td>
          <FileSize size={table.get('dataSizeBytes')} />
        </td>
        <td>
          <CreatedWithIcon createdTime={table.get('created')} relative={false} />
        </td>
        <td>
          {table.get('lastChangeDate') ? (
            <CreatedWithIcon createdTime={table.get('lastChangeDate')} relative={false} />
          ) : 'N/A'}
        </td>
      </tr>
    );
  },

  renderCreateTableModal() {
    return (
      <CreateTableModal
        bucket={this.props.bucket}
        openModal={this.state.openCreateTableModal}
        onCreateFromCsv={this.props.onCreateTableFromCsv}
        onCreateFromString={this.props.onCreateTableFromString}
        onHide={this.closeCreateTableModal}
        isCreatingTable={this.props.isCreatingTable}
        progress={this.props.uploadingProgress}
      />
    );
  },

  renderCreateAliasTableModal() {
    return (
      <CreateAliasTableModal
        bucket={this.props.bucket}
        openModal={this.state.openCreateAliasTableModal}
        onSubmit={this.props.onCreateAliasTable}
        onHide={this.closeCreateAliasTableModal}
        isSaving={this.props.isCreatingAliasTable}
      />
    );
  },

  canCreateAliasTable() {
    return this.canWriteBucket() && ['out', 'in'].includes(this.props.bucket.get('stage'));
  },

  canWriteBucket() {
    const bucketId = this.props.bucket.get('id');
    const permission = this.props.sapiToken.getIn(['bucketPermissions', bucketId], '');
    return ['write', 'manage'].includes(permission);
  },

  openCreateTableModal() {
    this.setState({
      openCreateTableModal: true
    });
  },

  closeCreateTableModal() {
    this.setState({
      openCreateTableModal: false
    });
  },

  openCreateAliasTableModal() {
    this.setState({
      openCreateAliasTableModal: true
    });
  },

  closeCreateAliasTableModal() {
    this.setState({
      openCreateAliasTableModal: false
    });
  }
});
