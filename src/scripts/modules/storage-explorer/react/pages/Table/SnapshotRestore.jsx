import PropTypes from 'prop-types';
import React from 'react';
import { Map, fromJS } from 'immutable';
import { Well, Table, Button, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Tooltip from '../../../../../react/common/Tooltip';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import StorageApi from '../../../../components/StorageApi';

import CreateSnapshotModal from '../../modals/CreateSnapshotModal';
import CreateTableFromSnapshotModal from '../../modals/CreateTableFromSnapshotModal';
import TimeTravelModal from '../../modals/TimeTravelModal';
import { createSnapshot, deleteSnapshot, createTableFromSnapshot, restoreUsingTimeTravel } from '../../../Actions';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    restoringTable: PropTypes.bool.isRequired,
    creatingSnapshot: PropTypes.bool.isRequired,
    creatingFromSnapshot: PropTypes.object.isRequired,
    deletingSnapshot: PropTypes.object.isRequired,
    canWriteTable: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      snapshots: Map(),
      pagingCount: 20,
      offset: 0,
      loading: false,
      hasMore: false,
      openCreateSnapshotModal: false,
      openTimeTravelModal: false,
      openCreateTableFromSnapshotModal: false,
      openRemoveSnapshotModal: false,
      selectedSnapshot: null
    };
  },

  componentDidMount() {
    this.fetchSnapshots();
  },

  componentDidUpdate(prevProps) {
    if (this.props.table.get('id') !== prevProps.table.get('id')) {
      this.refetchSnapshots();
    }
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  render() {
    return (
      <div>
        {this.props.canWriteTable && this.renderRestore()}
        {this.renderSnapshots()}
      </div>
    );
  },

  renderRestore() {
    const retentionLimit = this.props.sapiToken.getIn(['owner', 'dataRetentionTimeInDays']);

    return (
      <div>
        <h2>Time Travel Restore</h2>

        <Well>
          <p>
            Create a new table which will be a replica of the data as it existed at the time you choose. You can
            replicate data from up to <strong>{retentionLimit} days</strong> in past.
          </p>

          <Button bsStyle="primary" onClick={this.openTimeTravelModal} disabled={this.props.restoringTable}>
            {this.props.restoringTable ? (
              <span>
                <Loader /> Restoring Table...
              </span>
            ) : (
              <span>
                <i className="fa fa-camera" /> Restore Table
              </span>
            )}
          </Button>

          {this.renderTimeTravelModal()}
        </Well>
      </div>
    );
  },

  renderSnapshots() {
    return (
      <div>
        <h2>Snapshots</h2>

        {this.props.canWriteTable && (
          <Well>
            <p>Create and restore tables from snapshots.</p>

            <Button bsStyle="primary" onClick={this.openCreateSnapshotModal} disabled={this.props.creatingSnapshot}>
              {this.props.creatingSnapshot ? (
                <span>
                  <Loader /> Creating snapshot...
                </span>
              ) : (
                <span>
                  <i className="fa fa-camera" /> Create snapshot
                </span>
              )}
            </Button>

            {this.renderCreateSnapshotModal()}
          </Well>
        )}

        {this.renderSnapshotsTable()}
        {this.renderLoadMoreButton()}
      </div>
    );
  },

  renderSnapshotsTable() {
    if (this.state.loading && !this.state.snapshots.count()) {
      return (
        <p>
          Loading... <Loader />
        </p>
      );
    }

    if (!this.state.snapshots.count()) {
      return <p>No snapshots.</p>;
    }

    return (
      <Row>
        <Table responsive striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Created time</th>
              <th>Creator</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.state.snapshots.map(snapshot => {
              const creating = this.props.creatingFromSnapshot.get(snapshot.get('id'), false);
              const deleting = this.props.deletingSnapshot.get(snapshot.get('id'), false);

              return (
                <tr key={snapshot.get('id')}>
                  <td>{snapshot.get('id')}</td>
                  <td>{snapshot.get('description')}</td>
                  <td>
                    <CreatedWithIcon createdTime={snapshot.get('createdTime')} relative={false} />
                  </td>
                  <td>
                    <span title={`ID: ${snapshot.getIn(['creatorToken', 'id'])}`}>
                      {snapshot.getIn(['creatorToken', 'description'])}
                    </span>
                  </td>
                  <td className="text-right">
                    <Tooltip tooltip="Create new table from snapshot" placement="top">
                      <Button
                        bsStyle="link"
                        onClick={() => this.openCreateTableFromSnapshotModal(snapshot)}
                        disabled={creating}
                      >
                        {creating ? <Loader /> : <i className="fa fa-share" />}
                      </Button>
                    </Tooltip>
                    <Tooltip tooltip="Delete snapshot" placement="top">
                      <Button bsStyle="link" onClick={() => this.openRemoveSnapshotModal(snapshot)} disabled={deleting}>
                        {deleting ? <Loader /> : <i className="fa fa-trash-o" />}
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {this.renderCreateTableFromSnapshotModal()}
        {this.renderDeleteSnapshotModal()}
      </Row>
    );
  },

  renderLoadMoreButton() {
    if (!this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding">
        <Button onClick={this.fetchSnapshots} disabled={this.state.loading}>
          {this.state.loading && this.state.snapshots.count() ? (
            <span>
              Loading... <Loader />
            </span>
          ) : (
            'Load more'
          )}
        </Button>
      </div>
    );
  },

  renderTimeTravelModal() {
    return (
      <TimeTravelModal
        show={this.state.openTimeTravelModal}
        table={this.props.table}
        buckets={this.props.buckets}
        sapiToken={this.props.sapiToken}
        onConfirm={this.handleTimeTravel}
        onHide={this.closeTimeTravelModal}
      />
    );
  },

  renderCreateSnapshotModal() {
    return (
      <CreateSnapshotModal
        show={this.state.openCreateSnapshotModal}
        onConfirm={this.handleCreateSnapshot}
        onHide={this.closeCreateSnapshotModal}
      />
    );
  },

  renderCreateTableFromSnapshotModal() {
    const snapshot = this.state.selectedSnapshot;

    if (!snapshot) {
      return null;
    }

    return (
      <CreateTableFromSnapshotModal
        tableName={this.props.table.get('name')}
        show={this.state.openCreateTableFromSnapshotModal}
        snapshot={snapshot}
        buckets={this.props.buckets}
        onConfirm={this.handleCreateTableFromSnapshot}
        onHide={this.closeCreateTableFromSnapshotModal}
      />
    );
  },

  renderDeleteSnapshotModal() {
    const snapshot = this.state.selectedSnapshot;

    if (!snapshot) {
      return null;
    }

    return (
      <ConfirmModal
        show={this.state.openRemoveSnapshotModal}
        title="Delete snapshot"
        buttonType="danger"
        buttonLabel="Delete"
        text={
          snapshot.get('description') ? (
            <p>
              Do you really want to delete snapshot {snapshot.get('id')} ({snapshot.get('description')})?
            </p>
          ) : (
            <p>Do you really want to delete snapshot {snapshot.get('id')}?</p>
          )
        }
        onConfirm={this.handleRemoveSnapshot}
        onHide={this.closeRemoveSnapshotModal}
      />
    );
  },

  handleTimeTravel(bucketId, tableName, timestamp) {
    const params = {
      sourceTableId: this.props.table.get('id'),
      timestamp: timestamp.format('YYYY-MM-DD HH:mm:ss Z'),
      name: tableName
    };

    return restoreUsingTimeTravel(bucketId, params);
  },

  handleCreateSnapshot(description) {
    const tableId = this.props.table.get('id');
    const params = { description };

    return createSnapshot(tableId, params).then(() => {
      this.refetchSnapshots();
    });
  },

  handleCreateTableFromSnapshot(bucketId, tableName) {
    const params = {
      snapshotId: this.state.selectedSnapshot.get('id'),
      name: tableName
    };

    return createTableFromSnapshot(bucketId, params);
  },

  handleRemoveSnapshot() {
    const snapshotId = this.state.selectedSnapshot.get('id');

    return deleteSnapshot(snapshotId).then(() => {
      this.setState({
        selectedSnapshot: null
      });

      this.refetchSnapshots();
    });
  },

  refetchSnapshots() {
    this.fetchSnapshots(true);
  },

  fetchSnapshots(refetch = false) {
    const tableId = this.props.table.get('id');
    const params = {
      limit: this.state.pagingCount + 1,
      offset: refetch ? 0 : this.state.offset
    };

    this.setState({ loading: true });
    this.cancellablePromise = StorageApi.loadTableSnapshots(tableId, params)
      .then(data => {
        this.setState({
          loading: false,
          hasMore: data.length > this.state.pagingCount,
          snapshots: fromJS(refetch ? data : this.state.snapshots.toArray().concat(data)),
          offset: this.state.pagingCount + 1
        });
      });
  },

  openCreateSnapshotModal() {
    this.setState({
      openCreateSnapshotModal: true
    });
  },

  closeCreateSnapshotModal() {
    this.setState({
      openCreateSnapshotModal: false
    });
  },

  openTimeTravelModal() {
    this.setState({
      openTimeTravelModal: true
    });
  },

  closeTimeTravelModal() {
    this.setState({
      openTimeTravelModal: false
    });
  },

  openCreateTableFromSnapshotModal(snapshot) {
    this.setState({
      openCreateTableFromSnapshotModal: true,
      selectedSnapshot: snapshot
    });
  },

  closeCreateTableFromSnapshotModal() {
    this.setState({
      openCreateTableFromSnapshotModal: false,
      selectedSnapshot: null
    });
  },

  openRemoveSnapshotModal(snapshot) {
    this.setState({
      openRemoveSnapshotModal: true,
      selectedSnapshot: snapshot
    });
  },

  closeRemoveSnapshotModal() {
    this.setState({
      openRemoveSnapshotModal: false,
      selectedSnapshot: null
    });
  }
});
