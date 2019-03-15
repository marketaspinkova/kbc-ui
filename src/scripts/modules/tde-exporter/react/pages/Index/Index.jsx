import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import _ from 'underscore';
import classnames from 'classnames';
import { Link } from 'react-router';
import { Map, fromJS } from 'immutable';
import { Button } from 'react-bootstrap';
import { RefreshIcon } from '@keboola/indigo-ui';

import * as tdeCommon from '../../../tdeCommon';
import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import StorageFilesStore from '../../../../components/stores/StorageFilesStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import Tooltip from '../../../../../react/common/Tooltip';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import TablesByBucketsPanel from '../../../../components/react/components/TablesByBucketsPanel';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import storageActionCreators from '../../../../components/StorageActionCreators';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import TableRow from './TableRow';
import AddNewTableModal from './AddNewTableModal';

const componentId = 'tde-exporter';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore, StorageFilesStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const configData = InstalledComponentsStore.getConfigData(componentId, configId);

    return {
      configId,
      configData,
      files: StorageFilesStore.getAll(),
      isLoadingFiles: StorageFilesStore.getIsLoading(),
      localState: InstalledComponentsStore.getLocalState(componentId, configId),
      typedefs: configData.getIn(['parameters', 'typedefs'], Map()),
      isSaving: InstalledComponentsStore.getSavingConfigData(componentId, configId)
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

  _renderMainContent() {
    return (
      <div className="col-md-9 kbc-main-content">
        <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
          <ComponentDescription componentId={componentId} configId={this.state.configId} />
        </div>
        {!this._isEmptyConfig() && (
          <div className="kbc-inner-padding text-right">
            <div className="kbc-buttons">
              {this._addNewTableButton()}
              {this._renderAddNewTable()}
            </div>
          </div>
        )}
        {!this._isEmptyConfig() ? (
          this._renderTables()
        ) : (
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border text-center">
            <div>
              <p>No tables configured.</p>
              {this._addNewTableButton()}
              {this._renderAddNewTable()}
            </div>
          </div>
        )}
      </div>
    );
  },

  _renderTables() {
    return (
      <TablesByBucketsPanel
        renderTableRowFn={this._renderTableRow}
        renderHeaderRowFn={this._renderHeaderRow}
        filterFn={this._filterBuckets}
        isTableExportedFn={tableId => this.state.typedefs.has(tableId)}
        onToggleBucketFn={this._handleToggleBucket}
        isBucketToggledFn={this._isBucketToggled}
        showAllTables={false}
        configuredTables={this.state.typedefs.keySeq().toJS()}
      />
    );
  },

  _renderSideBar() {
    return (
      <div className="col-md-3 kbc-main-sidebar">
        <div className="kbc-buttons kbc-text-light">
          <ComponentMetadata componentId={componentId} configId={this.state.configId} />
        </div>
        <ul className="nav nav-stacked">
          <li className={classnames({ disabled: !!this._disabledToRun() })}>
            <RunButtonModal
              disabled={!!this._disabledToRun()}
              disabledReason={this._disabledToRun()}
              title="Export tables to TDE"
              tooltip="Export all configured tables to TDE files"
              mode="link"
              component={componentId}
              runParams={() => {
                return { config: this.state.configId };
              }}
            >
              You are about to run an export of all configured tables to TDE
            </RunButtonModal>
          </li>
          <li>{this._renderSetupDestinationLink()}</li>
          <li>
            <DeleteConfigurationButton componentId={componentId} configId={this.state.configId} />
          </li>
        </ul>
        <SidebarJobsContainer
          componentId={componentId}
          configId={this.state.configId}
          limit={3}
        />
        <LatestVersions componentId={componentId} limit={3} />
      </div>
    );
  },

  _renderSetupDestinationLink() {
    return (
      <Link
        to="tde-exporter-destination"
        className="btn btn-link "
        params={{
          config: this.state.configId
        }}
      >
        <i className="fa fa-fw fa-gear" />
        {' Setup Upload'}
      </Link>
    );
  },

  _renderTableRow(table, index) {
    const tableId = table.get('id');
    const tdeFileName = tdeCommon.getTdeFileName(this.state.configData, tableId);

    return (
      <TableRow
        key={index}
        table={table}
        configId={this.state.configId}
        tdeFile={this._getLastTdeFile(tdeFileName)}
        tdeFileName={tdeFileName}
        prepareRunDataFn={() => this._prepareRunTableData(tableId)}
        deleteRowFn={() => this._deleteTable(tableId)}
        configData={this.state.configData}
        uploadComponentId={this.state.localState.get('uploadComponentId')}
        uploadComponentIdSetFn={uploadComponentId => {
          this._updateLocalState(['uploadComponentId'], uploadComponentId);
        }}
      />
    );
  },

  _filterBuckets(buckets) {
    return buckets.filter(bucket => bucket.get('stage') === 'out' || bucket.get('stage') === 'in');
  },

  _renderAddNewTable() {
    const show = !!(this.state.localState && this.state.localState.getIn(['newTable', 'show']));

    return (
      <AddNewTableModal
        show={show}
        selectedTableId={this.state.localState.getIn(['newTable', 'id'], '')}
        configuredTables={this.state.configData.getIn(['parameters', 'typedefs'])}
        configId={this.state.configId}
        onHideFn={() => {
          this._updateLocalState(['newTable'], Map());
        }}
        onSetTableIdFn={value => {
          this._updateLocalState(['newTable', 'id'], value);
        }}
        onSaveFn={selectedTableId => {
          RoutesStore.getRouter().transitionTo('tde-exporter-table', {
            config: this.state.configId,
            tableId: selectedTableId
          });
        }}
      />
    );
  },

  _addNewTableButton() {
    return (
      <Button
        bsStyle="success"
        onClick={() => {
          this._updateLocalState(['newTable', 'show'], true);
        }}
      >
        <i className="kbc-icon-plus" />
        {' New Table'}
      </Button>
    );
  },

  _renderHeaderRow() {
    return (
      <div className="tr">
        <span className="th">
          <strong>Table name</strong>
        </span>
        <span className="th">
          <strong>{'TDE File '}</strong>
          <Tooltip id="refresh_tooltip" tooltip="Refresh TDE files list" placement="top">
            <RefreshIcon isLoading={this.state.isLoadingFiles} onClick={() => this._refreshFiles()} />
          </Tooltip>
        </span>
        <span className="th" />
      </div>
    );
  },

  _refreshFiles() {
    const tags = ['tde', 'table-export'];
    const params = { q: _.map(tags, t => `+tags:${t}`).join(' ') };
    storageActionCreators.loadFilesForce(params);
  },

  _getLastTdeFile(tdeFileName) {
    const filename = tdeFileName.replace(/-/g, '_').toLowerCase();
    const files = this.state.files.filter(file => {
      return file.get('name').toLowerCase() === filename;
    });

    return files.max((a, b) => {
      const adate = moment(a.get('created'));
      const bdate = moment(b.get('created'));
      if (adate === bdate) {
        return 0;
      }
      return adate > bdate ? 1 : -1;
    });
  },

  _deleteTable(tableId) {
    let { configData } = this.state;
    let intables = configData.getIn(['storage', 'input', 'tables']);
    if (intables) {
      intables = intables.filter(intable => intable.get('source') !== tableId);
      configData = configData.setIn(['storage', 'input', 'tables'], intables);
    }
    configData = configData.deleteIn(['parameters', 'typedefs', tableId]);
    configData = configData.deleteIn(['parameters', 'tables', tableId]);

    InstalledComponentsActions.saveComponentConfigData(componentId, this.state.configId, configData);
  },

  _prepareRunTableData(tableId) {
    let { configData } = this.state;
    let intables = configData.getIn(['storage', 'input', 'tables']);
    intables = intables.filter(intable => intable.get('source') === tableId);
    configData = configData.setIn(['storage', 'input', 'tables'], intables);
    const typedefs = configData.getIn(['parameters', 'typedefs', tableId]);
    configData = configData.setIn(['parameters', 'typedefs'], Map());
    configData = configData.setIn(['parameters', 'typedefs', tableId], typedefs);
    const tags = [`config-${this.state.configId}`];
    configData = configData.setIn(['parameters', 'tags'], fromJS(tags));
    const data = {
      configData: configData.toJS(),
      config: this.state.configId
    };
    return data;
  },

  _disabledToRun() {
    if (this._isEmptyConfig()) {
      return 'No tables configured';
    }
    return null;
  },

  _isEmptyConfig() {
    const tables = this.state.configData.getIn(['storage', 'input', 'tables']);
    return !(tables && tables.count() > 0);
  },

  _handleToggleBucket(bucketId) {
    const newValue = !this._isBucketToggled(bucketId);
    const bucketToggles = this.state.localState.get('bucketToggles', Map());
    const newToggles = bucketToggles.set(bucketId, newValue);
    this._updateLocalState(['bucketToggles'], newToggles);
  },

  _isBucketToggled(bucketId) {
    const bucketToggles = this.state.localState.get('bucketToggles', Map());
    return !!bucketToggles.get(bucketId);
  },

  _updateLocalState(path, data) {
    const newLocalState = this.state.localState.setIn(path, data);
    InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  }
});
