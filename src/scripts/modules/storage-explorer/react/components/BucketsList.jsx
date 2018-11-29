import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Map } from 'immutable';
import { Panel, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';
import Tooltip from '../../../../react/common/Tooltip';
import RoutesStore from '../../../../stores/RoutesStore';
import CreateAliasTableModal from '../modals/CreateAliasTableModal';

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    onDeleteBucket: PropTypes.func.isRequired,
    onCreateAliasTable: PropTypes.func.isRequired,
    deletingBuckets: PropTypes.object.isRequired,
    isCreatingAliasTable: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      openCreateAliasTableModal: false,
      openCreateAliasTableBucket: Map()
    };
  },

  render() {
    if (!this.props.buckets.count()) {
      return <p>No buckets found.</p>;
    }

    return (
      <div>
        {this.renderCreateAliasTableModal()}
        {this.props.buckets.map(this.renderBucketPanel).toArray()}
      </div>
    );
  },

  renderBucketPanel(bucket) {
    return (
      <Panel header={this.renderBucketHeader(bucket)} key={bucket.get('id')} collapsible={true}>
        {this.renderTables(bucket)}
      </Panel>
    );
  },

  renderBucketHeader(bucket) {
    const deleting = this.props.deletingBuckets.has(bucket.get('id'));
    const tables = this.props.tables.filter(table => {
      return table.getIn(['bucket', 'id']) === bucket.get('id');
    });

    return (
      <div>
        <h4>{bucket.get('id')}</h4>
        <div className="clearfix">
          <div className="pull-right">
            {this.canCreateAliasTable(bucket) && (
              <Tooltip tooltip="Create new alias table" placement="top">
                <Button
                  className="btn btn-link"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openCreateAliasTableModal(bucket);
                  }}
                >
                  <i className="fa fa-random" />
                </Button>
              </Tooltip>
            )}
            <Confirm
              title="Delete bucket"
              text={
                <span>
                  <p>Do you really want to delete bucket {bucket.get('id')}?</p>
                  {tables.count() > 0 && <p>Bucket is not empty. All tables will be also deleted!</p>}
                </span>
              }
              buttonLabel="Delete"
              onConfirm={() => this.deleteBucket(bucket, tables)}
            >
              <Tooltip tooltip="Delete bucket" placement="top">
                <Button className="btn btn-link" disabled={deleting}>
                  {deleting ? <Loader /> : <i className="fa fa-fw fa-trash" />}
                </Button>
              </Tooltip>
            </Confirm>
            <Tooltip tooltip="Bucket detail" placement="top">
              <Button
                className="btn btn-link"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.goToBucketDetail(bucket);
                }}
              >
                <i className="fa fa-fw fa-chevron-right" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  },

  renderTables(bucket) {
    const tables = this.props.tables.filter(table => {
      return table.getIn(['bucket', 'id']) === bucket.get('id');
    });

    if (!tables.count()) {
      return <p>No tables.</p>;
    }

    return tables.map(this.renderTable).toArray();
  },

  renderTable(table) {
    const bucketId = table.getIn(['bucket', 'id']);
    const tableName = table.get('name');

    return (
      <Link to="storage-explorer-table" params={{ bucketId, tableName }} key={table.get('id')}>
        <p>{tableName}</p>
      </Link>
    );
  },

  renderCreateAliasTableModal() {
    return (
      <CreateAliasTableModal
        bucket={this.state.openCreateAliasTableBucket}
        tables={this.props.tables}
        openModal={this.state.openCreateAliasTableModal}
        onSubmit={this.props.onCreateAliasTable}
        onHide={this.closeCreateAliasTableModal}
        isSaving={this.props.isCreatingAliasTable}
      />
    );
  },

  goToBucketDetail(bucket) {
    RoutesStore.getRouter().transitionTo('storage-explorer-bucket', {
      bucketId: bucket.get('id')
    });
  },

  canCreateAliasTable(bucket) {
    return this.canWriteBucket(bucket) && ['out', 'in'].includes(bucket.get('stage'));
  },

  canWriteBucket(bucket) {
    const bucketId = bucket.get('id');
    const permissions = this.props.sapiToken.getIn(['bucketPermissions', bucketId], '');
    return ['write', 'manage'].includes(permissions);
  },

  deleteBucket(bucket, tables) {
    const bucketId = bucket.get('id');
    const force = tables.count() > 0;
    this.props.onDeleteBucket(bucketId, force);
  },

  openCreateAliasTableModal(bucket) {
    this.setState({
      openCreateAliasTableModal: true,
      openCreateAliasTableBucket: bucket
    });
  },

  closeCreateAliasTableModal() {
    this.setState({
      openCreateAliasTableModal: false,
      openCreateAliasTableBucket: Map()
    });
  }
});
