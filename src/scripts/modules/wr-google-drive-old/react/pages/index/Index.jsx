import React from 'react';
import { Map, fromJS } from 'immutable';
import _ from 'underscore';
import classnames from 'classnames';
import { Link } from 'react-router';
import { SearchBar } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import LatestJobs from '../../../../components/react/components/SidebarJobs';
import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import TablesByBucketsPanel from '../../../../components/react/components/TablesByBucketsPanel';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import MigrationRow from '../../../../components/react/components/MigrationRow';

import GdriveStore from '../../../wrGdriveStore';
import gdriveActions from '../../../wrGdriveActionCreators';
import RowEditor from './RowEditor';
import TableRow from './TableRow';

const componentId = 'wr-google-drive';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, GdriveStore, LatestJobsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const localState = InstalledComponentsStore.getLocalState(componentId, configId);
    const files = GdriveStore.getFiles(configId);
    const editingFiles = GdriveStore.getEditingByPath(configId, 'files');
    const newTableEditData = GdriveStore.getEditingByPath(configId, 'newtable');
    const savingFiles = GdriveStore.getSavingFiles(configId);
    const deletingFiles = GdriveStore.getDeletingFiles(configId);
    const account = GdriveStore.getAccount(configId);

    return {
      newTableEditData,
      latestJobs: LatestJobsStore.getJobs(componentId, configId),
      account,
      deletingFiles,
      savingFiles,
      editingFiles,
      files,
      configId,
      localState,
      googleInfo: GdriveStore.getGoogleInfo(configId)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        {this._renderMainContent()}
        {this._renderSideBar()}
      </div>
    );
  },

  componentDidMount() {
    this.state.files.forEach((file) => {
      const targetFolder = file.get('targetFolder');
      if (!_.isEmpty(targetFolder)) {
        return this._loadGoogleInfo(targetFolder);
      }
    });

    // if no files are configured then show all tables
    if (this.state.files.count() === 0) {
      return this._updateLocalState(['showAll'], true);
    }
  },

  _renderMainContent() {
    const tablesIds = this.state.files && this.state.files.keySeq();
    return (
      <div className="col-md-9 kbc-main-content">
        <div className="kbc-inner-padding">
          <MigrationRow componentId="wr-google-drive" />
        </div>
        <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
          <ComponentDescription componentId={componentId} configId={this.state.configId} />
        </div>
        {this._isAuthorized() && this._isConfigured() && (
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            {this._renderAddNewTable()}
            <SearchBar
              onChange={this._handleSearchQueryChange}
              query={this.state.localState.get('searchQuery') || ''}
              additionalActions={this._addNewTableButton()}
            />
          </div>
        )}
        {this._isAuthorized() && this._isConfigured()
          ? (
            <TablesByBucketsPanel
              renderTableRowFn={this._renderTableRow}
              renderHeaderRowFn={this._renderHeaderRow}
              filterFn={this._filterBuckets}
              searchQuery={this.state.localState.get('searchQuery')}
              isTableExportedFn={(tableId) => {
                return this.state.files.has(tableId);
              }}
              onToggleBucketFn={this._handleToggleBucket}
              isBucketToggledFn={this._isBucketToggled}
              showAllTables={false}
              configuredTables={tablesIds.toJS()}
              renderDeletedTableRowFn={(table, index) => {
                return this._renderTableRow(table, index, true);
              }}
            />
          ) : (
            <div className="row component-empty-state text-center">
              {!this._isAuthorized()
                ? (
                  <div>
                    <p>
                      No Google Drive Account Authorized.
                    </p>
                    <Link
                      className="btn btn-success"
                      to="wr-google-drive-authorize"
                      params={{
                        config: this.state.configId
                      }}>
                      <i className="fa fa-fw fa-user" />
                      {' Authorize Google Account'}
                    </Link>
                  </div>
                )
                : (
                  <div>
                    <p>
                      No tables configured yet.
                    </p>
                    {this._renderAddNewTable()}
                    {this._addNewTableButton()}
                  </div>
                )}
            </div>
          )}
      </div>
    );
  },

  _addNewTableButton() {
    return (
      <button
        className="btn btn-success"
        onClick={() => {
          const emptyFile = {
            title: '',
            tableId: '',
            operation: 'update',
            type: 'sheet'
          };
          gdriveActions.setEditingData(this.state.configId, ['newtable'], fromJS(emptyFile));
        }}
      >
        Create Table
      </button>
    );
  },

  _renderSideBar() {
    return (
      <div className="col-md-3 kbc-main-sidebar">
        <div className="kbc-buttons kbc-text-light">
          <span>
            {'Authorized for '}
          </span>
          <strong>
            {this._getAuthorizedForCaption()}
          </strong>
          <ComponentMetadata componentId={componentId} configId={this.state.configId} />
        </div>
        <ul className="nav nav-stacked">
          {this._isAuthorized() && (
            <li>
              <Link
                to="wr-google-drive-authorize"
                params={{
                  config: this.state.configId
                }}>
                <i className="fa fa-fw fa-user" />
                Authorize
              </Link>
            </li>
          )}
          <li className={classnames({ disabled: !!this._disabledToRun() })}>
            <RunButtonModal
              disabled={!!this._disabledToRun()}
              disabledReason={this._disabledToRun()}
              title="Run"
              tooltip="Upload all selected tables"
              mode="link"
              icon="fa fa-play fa-fw"
              component={componentId}
              runParams={() => {
                return { config: this.state.configId };
              }}>
              You are about to run an upload of all selected tables
            </RunButtonModal>
          </li>
          <li>
            <DeleteConfigurationButton componentId={componentId} configId={this.state.configId} />
          </li>
        </ul>
        <LatestJobs jobs={this.state.latestJobs} />
      </div>
    );
  },

  _renderHeaderRow() {
    return (
      <div className="tr">
        <span className="th">
          <strong>
            Table name
          </strong>
        </span>
        <span className="th">
          {''}
        </span>
        <span className="th">
          <strong>
            Title
          </strong>
        </span>
        <span className="th">
          <strong>
            Operation
          </strong>
        </span>
        <span className="th">
          <strong>
            Type
          </strong>
        </span>
        <span className="th">
          <strong>
            Folder
          </strong>
        </span>
      </div>
    );
  },

  _renderAddNewTable() {
    const tablesIds = this.state.files && this.state.files.keySeq().toJS();
    if (this.state.newTableEditData) {
      return (
        <RowEditor
          table={null}
          updateGoogleFolderFn={(info, googleId) => {
            return this._updateGoogleFolder(this.state.configId, googleId, info);
          }}
          email={this.state.account && this.state.account.get('email')}
          googleInfo={this.state.googleInfo}
          saveFn={(data) => {
            const tableId = data.get('tableId');
            return gdriveActions.saveFile(this.state.configId, tableId, data);
          }}
          editData={this.state.newTableEditData}
          editFn={(data) => {
            const path = ['newtable'];
            return gdriveActions.setEditingData(this.state.configId, path, data);
          }}
          isSavingFn={(tableId) => {
            return !!this.state.savingFiles.get(tableId);
          }}
          renderToModal={true}
          configuredTableIds={tablesIds}
        />
      );
    }
  },

  _renderTableRow(table, index, isDeleted = false) {
    const tableId = table.get('id');
    const isSaving = this.state.savingFiles.get(tableId) || this.state.deletingFiles.get(tableId);

    return (
      <TableRow
        key={index}
        email={this.state.account && this.state.account.get('email')}
        configId={this.state.configId}
        editFn={(data) => {
          return this._setEditingFile(tableId, data);
        }}
        deleteRowFn={(rowId) => {
          return gdriveActions.deleteRow(this.state.configId, rowId, tableId);
        }}
        saveFn={(data) => {
          return gdriveActions.saveFile(this.state.configId, tableId, data);
        }}
        isSavingFn={function() {
          return isSaving;
        }}
        editData={this.state.editingFiles && this.state.editingFiles.get(tableId)}
        table={table}
        file={this.state.files.find((f) => f.get('tableId') === tableId)}
        googleInfo={this.state.googleInfo}
        updateGoogleFolderFn={(info, googleId) => {
          return this._updateGoogleFolder(this.state.configId, googleId, info);
        }}
        loadGoogleInfoFn={(googleId) => {
          return this._loadGoogleInfo(googleId);
        }}
        isLoadingGoogleInfoFn={(googleId) => {
          return GdriveStore.getLoadingGoogleInfo(this.state.configId, googleId);
        }}
        isDeleted={isDeleted} />
    );
  },

  _setEditingFile(tableId, data) {
    const path = ['files', tableId];
    return gdriveActions.setEditingData(this.state.configId, path, data);
  },

  _loadGoogleInfo(googleId) {
    return gdriveActions.loadGoogleInfo(this.state.configId, googleId);
  },

  _isAuthorized() {
    return !!(this.state.account && this.state.account.get('email'));
  },

  _disabledToRun() {
    if (!this._isAuthorized()) {
      return 'No Google Drive Account';
    }
    if ((this.state.files && this.state.files.count()) === 0) {
      return 'No tables configured';
    }
    return null;
  },

  _isConfigured() {
    return (this.state.files && this.state.files.count()) > 0;
  },

  _handleSearchQueryChange(newQuery) {
    return this._updateLocalState(['searchQuery'], newQuery);
  },

  _filterBuckets(buckets) {
    return buckets.filter(
      (bucket) => bucket.get('stage') === 'out' || bucket.get('stage') === 'in'
    );
  },

  _handleToggleBucket(bucketId) {
    const newValue = !this._isBucketToggled(bucketId);
    const bucketToggles = this.state.localState.get('bucketToggles', Map());
    const newToggles = bucketToggles.set(bucketId, newValue);
    return this._updateLocalState(['bucketToggles'], newToggles);
  },

  _isBucketToggled(bucketId) {
    const bucketToggles = this.state.localState.get('bucketToggles', Map());
    return !!bucketToggles.get(bucketId);
  },

  _getEmail() {
    return this.state.account.get('email');
  },

  _getAuthorizedForCaption() {
    const email = this._getEmail();
    if (!email) {
      return 'not authorized';
    } else {
      return email;
    }
  },

  _updateGoogleFolder(configId, googleId, info) {
    return gdriveActions.setGoogleInfo(configId, googleId, info);
  },

  _updateLocalState(path, data) {
    const newLocalState = this.state.localState.setIn(path, data);
    return InstalledComponentsActions.updateLocalState(
      componentId,
      this.state.configId,
      newLocalState,
      path
    );
  }
});
