import React, { PropTypes } from 'react';
import { Map, fromJS } from 'immutable';
import { Well, Table, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Tooltip from '../../../../../react/common/Tooltip';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import StorageApi from '../../../../components/StorageApi';
import StorageActionCreators from '../../../../components/StorageActionCreators';

import CreateSnapshotModal from '../../modals/CreateSnapshotModal';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    creatingSnapshot: PropTypes.object.isRequired,
    deletingSnapshot: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      snapshots: Map(),
      pagingCount: 20,
      offset: 0,
      loading: false,
      hasMore: false,
      openCreateSnapshotModal: false,
      openRemoveSnapshotModal: false,
      removeSnapshot: null
    };
  },

  componentDidMount() {
    this.fetchSnapshots();
  },

  render() {
    return (
      <div>
        {this.canWriteTable() && this.renderRestore()}
        {this.renderSnapshots()}
      </div>
    );
  },

  renderRestore() {
    const retentionLimit = this.props.sapiToken.getIn(['owner', 'dataRetentionTimeInDays']);

    return (
      <div>
        <h3>Time Travel Restore</h3>

        <Well>
          <p>
            Create a new table which will be a replica of the data as it existed at the time you choose. You can
            replicate data from up to <strong>{retentionLimit} days</strong> in past.
          </p>

          <Button bsStyle="primary" onClick={() => null}>
            <i className="fa fa-camera" /> Restore Table
          </Button>
        </Well>
      </div>
    );
  },

  renderSnapshots() {
    const creating = this.props.creatingSnapshot.get(this.props.table.get('id'), false);

    return (
      <div>
        <h3>Snapshots</h3>

        {this.canWriteTable() && (
          <Well>
            <p>Create and restore tables from snapshots.</p>

            <Button bsStyle="primary" onClick={this.openCreateSnapshotModal} disabled={creating}>
              {creating ? (
                <span>
                  <Loader /> Creating snapshot...
                </span>
              ) : (
                <span>
                  <i className="fa fa-camera" /> Create snapshot
                </span>
              )}
            </Button>

            {this.state.openCreateSnapshotModal && this.renderCreateSnapshotModal()}
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
      <div>
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
                      <Button className="btn btn-link" onClick={() => null}>
                        <i className="fa fa-share" />
                      </Button>
                    </Tooltip>
                    <Tooltip tooltip="Delete snapshot" placement="top">
                      <Button
                        className="btn btn-link"
                        onClick={() => this.openRemoveSnapshotModal(snapshot)}
                        disabled={deleting}
                      >
                        {deleting ? <Loader /> : <i className="fa fa-trash-o" />}
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {this.renderDeleteSnapshotModal()}
      </div>
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

  renderCreateSnapshotModal() {
    return <CreateSnapshotModal onConfirm={this.handleCreateSnapshot} onHide={this.closeCreateSnapshotModal} />;
  },

  renderDeleteSnapshotModal() {
    const snapshot = this.state.removeSnapshot;

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

  handleCreateSnapshot(description) {
    const tableId = this.props.table.get('id');
    const params = { description };

    return StorageActionCreators.createSnapshot(tableId, params).then(() => {
      this.fetchSnapshots(true);
    });
  },

  handleRemoveSnapshot() {
    const snapshotId = this.state.removeSnapshot.get('id');

    return StorageActionCreators.deleteSnapshot(snapshotId).then(() => {
      this.setState({
        removeSnapshot: null
      });

      this.fetchSnapshots(true);
    });
  },

  canWriteTable() {
    const bucketId = this.props.table.getIn(['bucket', 'id']);
    const permission = this.props.sapiToken.getIn(['bucketPermissions', bucketId]);

    return ['write', 'manage'].includes(permission);
  },

  fetchSnapshots(refetch = false) {
    const tableId = this.props.table.get('id');
    const params = {
      limit: this.state.pagingCount + 1,
      offset: refetch ? 0 : this.state.offset
    };

    this.setState({ loading: true });
    StorageApi.loadTableSnapshots(tableId, params)
      .then(data => {
        this.setState({
          hasMore: data.length > this.state.pagingCount,
          snapshots: fromJS(refetch ? data : this.state.snapshots.toArray().concat(data)),
          offset: this.state.pagingCount + 1
        });
      })
      .finally(() => {
        this.setState({ loading: false });
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

  openRemoveSnapshotModal(snapshot) {
    this.setState({
      openRemoveSnapshotModal: true,
      removeSnapshot: snapshot
    });
  },

  closeRemoveSnapshotModal() {
    this.setState({
      openRemoveSnapshotModal: false,
      removeSnapshot: null
    });
  }
});
