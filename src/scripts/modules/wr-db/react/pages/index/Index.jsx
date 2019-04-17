import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import _ from 'underscore';
import classnames from 'classnames';
import { Link } from 'react-router';
import { SearchBar } from '@keboola/indigo-ui';
import { Button } from 'react-bootstrap';

import { wontMigrateComponents } from '../../../templates/migration';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import dockerProxyApi from '../../../templates/dockerProxyApi';
import ComponentEmptyState from '../../../../components/react/components/ComponentEmptyState';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import V2Actions from '../../../v2-actions';
import TableRow from './TableRow';
import TablesByBucketsPanel from '../../../../components/react/components/TablesByBucketsPanel';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';

import RoutesStore from '../../../../../stores/RoutesStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import WrDbStore from '../../../store';
import WrDbActions from '../../../actionCreators';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import ScheduleConfigurationButton from '../../../../components/react/components/ScheduleConfigurationButton';
import InstalledComponentsActions from '../../../../components/InstalledComponentsActionCreators';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import fieldsTemplate from '../../../templates/credentialsFields';
import AddNewTableModal from '../../../../../react/common/AddNewTableModal';
import MigrationRow from '../../../../components/react/components/MigrationRow';
import changedSinceConstants from '../../../../../react/common/changedSinceConstants';

const allowedBuckets = ['out', 'in'];

export default componentId => {
  return createReactClass({
    displayName: 'wrdbIndex',

    mixins: [createStoreMixin(StorageTablesStore, InstalledComponentsStore, WrDbStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const localState = InstalledComponentsStore.getLocalState(componentId, configId);
      const toggles = localState.get('bucketToggles', Map());
      const tables = WrDbStore.getTables(componentId, configId);
      const credentials = WrDbStore.getCredentials(componentId, configId);

      // state
      return {
        updatingTables: WrDbStore.getUpdatingTables(componentId, configId),
        allTables: StorageTablesStore.getAll(),
        tables,
        credentials,
        configId,
        hasCredentials: WrDbStore.hasCredentials(componentId, configId),
        localState,
        bucketToggles: toggles,
        deletingTables: WrDbStore.getDeletingTables(componentId, configId),
        v2Actions: V2Actions(configId, componentId)
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

    _hasTablesToExport() {
      return this.state.tables.reduce((reduction, table) => table.get('export') === true || reduction, false);
    },

    _hasValidCredentials() {
      if (!this.state.hasCredentials) {
        return false;
      }
      const fields = fieldsTemplate(componentId);
      const result = _.reduce(
        fields,
        (memo, field) => {
          const prop = field[1];
          const isHashed = prop[0] === '#';
          let hashFallbackEmpty = false;
          if (isHashed) {
            const nonHashedProp = prop.slice(1, prop.length);
            hashFallbackEmpty = _.isEmpty(this.state.credentials.get(nonHashedProp, '').toString());
          }
          return !(_.isEmpty(this.state.credentials.get(prop, '').toString()) && hashFallbackEmpty) && memo;
        },
        true
      );
      return result;
    },

    _renderAddNewTable() {
      const data = this.state.localState.get('newTable', Map());
      const selectedTableId = data.get('tableId');
      const inputTables = this.state.tables.toMap().mapKeys((key, c) => c.get('id'));
      const isAllConfigured =
        this.state.allTables
          .filter(t => {
            const bucket = t.getIn(['bucket', 'stage']);
            return allowedBuckets.includes(bucket) && !inputTables.has(t.get('id'));
          })
          .count() === 0;

      const updateStateFn = (path, newData) => {
        return this._updateLocalState(['newTable'].concat(path), newData);
      };

      return (
        <span>
          <Button disabled={isAllConfigured} onClick={() => updateStateFn(['show'], true)} bsStyle="success">
            + Add New Table
          </Button>
          <AddNewTableModal
            show={data.get('show', false)}
            allowedBuckets={allowedBuckets}
            onHideFn={() => this._updateLocalState([], Map())}
            selectedTableId={selectedTableId}
            onSetTableIdFn={tableId => updateStateFn(['tableId'], tableId)}
            configuredTables={inputTables}
            onSaveFn={tableId => {
              const selectedTable = this.state.allTables.find(t => t.get('id') === tableId);
              return WrDbActions.addTableToConfig(componentId, this.state.configId, tableId, selectedTable).then(() => {
                return RoutesStore.getRouter().transitionTo(`${componentId}-table`, {
                  tableId,
                  config: this.state.configId
                });
              });
            }}
            isSaving={this._isPendingTable(selectedTableId)}
          />
        </span>
      );
    },

    _hasConfigTables() {
      return this.state.tables.count() > 0;
    },

    _renderMainContent() {
      const configuredIds = this.state.tables.map(table => table.get('id'));
      const configuredTables = configuredIds ? configuredIds.toJS() : [];
      return (
        <div className="col-md-9 kbc-main-content">
          {!wontMigrateComponents.includes(componentId) && <MigrationRow componentId={componentId} />}
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription componentId={componentId} configId={this.state.configId} />
          </div>
          {this._hasValidCredentials() &&
            this._hasConfigTables() && (
            <div className="row-searchbar">
              <SearchBar
                onChange={this._handleSearchQueryChange}
                query={this.state.localState.get('searchQuery') || ''}
              />
            </div>
          )}
          {this._hasConfigTables() && <div className="kbc-inner-padding text-right">{this._renderAddNewTable()}</div>}
          {this._hasValidCredentials() && this._hasConfigTables() ? (
            <TablesByBucketsPanel
              renderTableRowFn={(table, index) => {
                return this._renderTableRow(table, index, true);
              }}
              renderDeletedTableRowFn={(table, index) => {
                return this._renderTableRow(table, index, false);
              }}
              renderHeaderRowFn={this._renderHeaderRow}
              filterFn={this._filterBuckets}
              searchQuery={this.state.localState.get('searchQuery')}
              isTableExportedFn={this._isTableExported}
              isTableShownFn={this._isTableInConfig}
              onToggleBucketFn={this._handleToggleBucket}
              isBucketToggledFn={this._isBucketToggled}
              configuredTables={configuredTables}
              showAllTables={false}
            />
          ) : (
            <ComponentEmptyState>
              {!this._hasValidCredentials() ? (
                <div>
                  <p>No credentials provided.</p>
                  <Link
                    className="btn btn-success"
                    to={`${componentId}-credentials`}
                    params={{
                      config: this.state.configId
                    }}
                  >
                    <i className="fa fa-fw fa-user" /> Set Up Credentials First
                  </Link>
                </div>
              ) : (
                this._renderAddNewTable()
              )}
            </ComponentEmptyState>
          )}
        </div>
      );
    },

    _disabledToRun() {
      if (!this._hasValidCredentials()) {
        return 'No database credentials provided';
      }
      if (!this._hasTablesToExport()) {
        return 'No tables selected to export';
      }
      return null;
    },

    _renderSideBar() {
      return (
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata componentId={componentId} configId={this.state.configId} />
          </div>
          <ul className="nav nav-stacked">
            {this._hasValidCredentials() && (
              <li>
                <Link
                  to={`${componentId}-credentials`}
                  params={{
                    config: this.state.configId
                  }}
                >
                  <i className="fa fa-fw fa-user" /> Database Credentials
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
                  const params = { writer: this.state.configId };
                  const api = dockerProxyApi(componentId);
                  return api && api.getRunParams(this.state.configId) ? api.getRunParams(this.state.configId) : params;
                }}
              >
                You are about to run an upload of all selected tables
              </RunButtonModal>
            </li>
            <li>
              <DeleteConfigurationButton componentId={componentId} configId={this.state.configId} />
            </li>
            <li>
              <ScheduleConfigurationButton componentId={componentId} configId={this.state.configId} />
            </li>
          </ul>
          <SidebarJobsContainer
            componentId={componentId}
            configId={this.state.configId}
            limit={3}
          />
          {dockerProxyApi(componentId) && <LatestVersions componentId={componentId} limit={3} />}
        </div>
      );
    },

    _renderTableRow(table, index, tableExists = true) {
      const tableMapping = this.state.v2Actions.getTableMapping(table.get('id'));

      return (
        <TableRow
          key={index}
          tableExists={!!(tableExists && tableMapping)}
          configId={this.state.configId}
          isV2={this.isV2()}
          v2ConfigTable={this.state.v2Actions.configTables.find(t => t.get('tableId') === table.get('id'))}
          tableDbName={this._getConfigTable(table.get('id')).get('name')}
          isTableExported={this._isTableExported(table.get('id'))}
          isPending={this._isPendingTable(table.get('id'))}
          isUpdating={this._isUpdating()}
          componentId={componentId}
          onExportChangeFn={() => {
            return this._handleExportChange(table.get('id'));
          }}
          table={table}
          prepareSingleUploadDataFn={this._prepareTableUploadData}
          deleteTableFn={tableId => {
            return WrDbActions.deleteTable(componentId, this.state.configId, tableId);
          }}
          isDeleting={!!this.state.deletingTables.get(table.get('id'))}
          isAdaptive={!!tableMapping && tableMapping.get('changed_since') === changedSinceConstants.ADAPTIVE_VALUE}
        />
      );
    },

    isV2() {
      return !!dockerProxyApi(componentId) && componentId !== 'wr-db-mssql';
    },

    _renderHeaderRow() {
      return (
        <div className="tr">
          <span className="th">
            <strong>Source Table</strong>
          </span>
          <span className="th">
            <strong>Destination Table</strong>
          </span>
          {this.isV2() && (
            <span className="th">
              <strong>Incremental</strong>
            </span>
          )}
        </div>
      );
    },

    _handleExportChange(tableId) {
      const isExported = this._isTableExported(tableId);
      const newExportedValue = !isExported;
      const table = this._getConfigTable(tableId);
      let dbName = tableId;
      if (table && table.get('name')) {
        dbName = table.get('name');
      }
      return WrDbActions.setTableToExport(componentId, this.state.configId, tableId, dbName, newExportedValue);
    },

    _isPendingTable(tableId) {
      return this.state.updatingTables.has(tableId);
    },

    _isUpdating() {
      return !!(this.state.updatingTables.count() || this.state.deletingTables.count());
    },

    _prepareTableUploadData() {
      return [];
    },

    _isTableInConfig(tableId) {
      return this.state.tables.find(t => t.get('id') === tableId);
    },

    _isTableExported(tableId) {
      const table = this._getConfigTable(tableId);
      return table && table.get('export') === true;
    },

    _filterBuckets(buckets) {
      return buckets.filter(bucket => {
        return allowedBuckets.includes(bucket.get('stage'));
      });
    },

    _handleToggleBucket(bucketId) {
      const newValue = !this._isBucketToggled(bucketId);
      const newToggles = this.state.bucketToggles.set(bucketId, newValue);
      return this._updateLocalState(['bucketToggles'], newToggles);
    },

    _isBucketToggled(bucketId) {
      return !!this.state.bucketToggles.get(bucketId);
    },

    _handleSearchQueryChange(newQuery) {
      return this._updateLocalState(['searchQuery'], newQuery);
    },

    _updateLocalState(path, data) {
      const newLocalState = this.state.localState.setIn(path, data);
      return InstalledComponentsActions.updateLocalState(componentId, this.state.configId, newLocalState, path);
    },

    _getConfigTable(tableId) {
      return this.state.tables.find(table => tableId === table.get('id'));
    }
  });
};
