import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { Table, Button } from 'react-bootstrap';
import { CreatedWithIcon } from '@keboola/indigo-ui';
import FileSize from '../../../../../react/common/FileSize';
import CreateAliasTableModal from '../../modals/CreateAliasTableModal';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    onCreateAliasTable: PropTypes.func.isRequired,
    isCreatingAliasTable: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      openCreateAliasTableModal: false
    };
  },

  render() {
    return (
      <div>
        <div className="clearfix">
          <div className="kbc-buttons pull-right">
            <Button
              bsStyle="success"
              onClick={this.openCreateAliasTableModal}
              disabled={this.props.isCreatingAliasTable}
            >
              Create table alias
            </Button>
          </div>
        </div>

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
          <tbody>{this.props.tables.map(this.renderTableRow).toArray()}</tbody>
        </Table>

        {this.renderCreateAliasTableModal()}
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
            className={classnames({ alias: table.get('isAlias', false) })}
          >
            {table.get('name')} {table.get('isAlias', false) && ' (Alias)'}
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
          <CreatedWithIcon createdTime={table.get('lastChangeDate')} relative={false} />
        </td>
      </tr>
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
    const permissions = this.props.sapiToken.getIn(['bucketPermissions', bucketId], '');
    return ['write', 'manage'].includes(permissions);
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
