import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import { Alert, DropdownButton } from 'react-bootstrap';
import { Loader, SearchBar, Protected } from '@keboola/indigo-ui';
import { Link } from 'react-router';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import ComponentEmptyState from '../../../../components/react/components/ComponentEmptyState';
import Confirm from '../../../../../react/common/Confirm';
import TablesByBucketsPanel from '../../../../components/react/components/TablesByBucketsPanel';
import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import InstalledComponentStore from '../../../../components/stores/InstalledComponentsStore';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import installedComponentsActions from '../../../../components/InstalledComponentsActionCreators';

import { GoodDataWriterTokenTypes } from '../../../../components/Constants';
import AddNewTableButton from '../../components/AddNewTableButton';
import TableRow from './TableRow';
import goodDataWriterStore from '../../../store';
import actionCreators from '../../../actionCreators';
import MigrationRow from '../../../../components/react/components/MigrationRow';

export default createReactClass({
  mixins: [
    createStoreMixin(
      goodDataWriterStore,
      InstalledComponentStore,
      StorageTablesStore
    )
  ],

  getStateFromStores() {
    const config = RoutesStore.getCurrentRouteParam('config');
    const localState = InstalledComponentStore.getLocalState('gooddata-writer', config);
    const writer = goodDataWriterStore.getWriter(config);

    return {
      configId: config,
      writer,
      pid: writer.getIn(['config', 'project', 'id']),
      tablesByBucket: goodDataWriterStore.getWriterTablesByBucket(config),
      filter: goodDataWriterStore.getWriterTablesFilter(config),
      deletingTables: goodDataWriterStore.getDeletingTables(config),
      localState,
      storageTables: StorageTablesStore.getAll()
    };
  },

  _handleFilterChange(query) {
    return actionCreators.setWriterTablesFilter(this.state.writer.getIn(['config', 'id']), query);
  },

  _renderAddNewTable() {
    const remainingTables = this.state.storageTables.filter((table) => {
      let needle;
      return (
        ((needle = table.getIn(['bucket', 'stage'])), ['out', 'in'].includes(needle)) &&
        !this.state.tablesByBucket.has(table.get('id'))
      );
    });

    return (
      <AddNewTableButton
        isDisabled={remainingTables.count() === 0}
        configuredTables={this.state.tablesByBucket}
        localState={this.state.localState.get('newTable', Map())}
        addNewTableFn={(tableId, data) => {
          return actionCreators.addNewTable(this.state.configId, tableId, data).then(() => {
            return actionCreators
              .saveTableField(this.state.configId, tableId, 'export', true)
              .then(() => {
                return RoutesStore.getRouter().transitionTo('gooddata-writer-table', {
                  config: this.state.configId,
                  table: tableId
                });
              });
          });
        }}
        updateLocalStateFn={(path, data) => {
          return this._updateLocalState(['newTable'].concat(path), data);
        }}
      />
    );
  },

  render() {
    const writer = this.state.writer.get('config');
    return (
      <div className="container-fluid">
        <MigrationRow
          componentId="gooddata-writer"
          replacementAppId="keboola.gooddata-writer"
        />
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription componentId="gooddata-writer" configId={writer.get('id')} />
          </div>
          {writer.get('info') && (
            <div className="row">
              <Alert bsStyle="warning">{writer.get('info')}</Alert>
            </div>
          )}
          {!writer.get('project') && (
            <div className="row">
              <Alert bsStyle="warning">No GoodData project assigned with this configuration.</Alert>
            </div>
          )}
          {this.state.tablesByBucket.count() > 0 && (
            <div className="row-searchbar">
              <SearchBar onChange={this._handleFilterChange} query={this.state.filter} />
            </div>
          )}
          {this.state.tablesByBucket.count() ? (
            <div>
              <div className="kbc-inner-padding text-right">{this._renderAddNewTable()}</div>
              {this._renderTablesByBucketsPanel()}
            </div>
          ) : (
            this._renderNotFound()
          )}
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata componentId="gooddata-writer" configId={this.state.configId} />
          </div>
          <div>{this._renderGoodDataTokenInfo()}</div>
          <ul className="nav nav-stacked">
            <li>
              <Link
                to="gooddata-writer-date-dimensions"
                params={{
                  config: writer.get('id')
                }}
              >
                <span className="fa fa-clock-o fa-fw" />
                {' Date Dimensions'}
              </Link>
            </li>
            <li>
              <Link
                to="jobs"
                query={{
                  q: `+component:gooddata-writer +params.config:${writer.get('id')}`
                }}
              >
                <span className="fa fa-tasks fa-fw" />
                {' Jobs Queue'}
              </Link>
            </li>
            <li>
              <Confirm
                text="Upload project"
                title="Are you sure you want to upload all tables to the GoodData project?"
                buttonLabel="Upload"
                buttonType="success"
                onConfirm={this._handleProjectUpload}
                childrenRootElement="a"
              >
                {this.state.writer.get('pendingActions', List()).contains('uploadProject') ? (
                  <Loader className="fa-fw" />
                ) : (
                  <span className="fa fa-upload fa-fw" />
                )}
                {' Upload project'}
              </Confirm>
            </li>
            <li>
              <Link
                to="gooddata-writer-model"
                params={{
                  config: this.state.writer.getIn(['config', 'id'])
                }}
              >
                <span className="fa fa-sitemap fa-fw" />
                {' Model'}
              </Link>
            </li>
          </ul>
          {writer.get('project') && (
            <ul className="nav nav-stacked">
              {writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete') && (
                <li>
                  <form
                    target="_blank"
                    method="POST"
                    action={this._getGoodDataLoginUrl()}
                  >
                    <input
                      type="hidden"
                      name="encryptedClaims"
                      value={writer.getIn(['project', 'encryptedClaims'])}
                    />
                    <input
                      type="hidden"
                      name="ssoProvider"
                      value={writer.getIn(['project', 'ssoProvider'])}
                    />
                    <input
                      type="hidden"
                      name="targetUrl"
                      value={`/#s=/gdc/projects/${this.state.pid}|projectDashboardPage`}
                    />
                    <button type="submit" className="btn btn-link">
                      <span className="fa fa-bar-chart-o fa-fw" />
                      {' GoodData Project'}
                    </button>
                  </form>
                </li>
              )}
              <li>
                {writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete') && (
                  <a onClick={this._handleProjectAccessDisable}>
                    {this.state.writer.get('pendingActions', List()).contains('projectAccess') ? (
                      <Loader className="fa-fw kbc-loader" />
                    ) : (
                      <span className="fa fa-unlink fa-fw" />
                    )}
                    {' Disable Access to Project'}
                  </a>
                )}
                {!writer.getIn(['project', 'ssoAccess']) && !writer.get('toDelete') && (
                  <a onClick={this._handleProjectAccessEnable}>
                    {this.state.writer.get('pendingActions', List()).contains('projectAccess') ? (
                      <Loader className="fa-fw kbc-loader" />
                    ) : (
                      <span className="fa fa-link fa-fw" />
                    )}
                    {' Enable Access to Project'}
                  </a>
                )}
              </li>
            </ul>
          )}
          {writer.get('project') && (
            <ul className="nav nav-stacked">
              <li>
                {this.state.writer.get('isOptimizingSLI') && (
                  <span>
                    {' '}
                    <Loader />
                  </span>
                )}
                <DropdownButton
                  title={
                    <span>
                      {<i className="fa fa-cog fa-fw" />}
                      {' Advanced'}
                    </span>
                  }
                  bsStyle="link"
                  id="modules-gooddata-writer-react-pages-index-index-dropdown"
                >
                  <li>
                    <Confirm
                      title="Optimize SLI hash"
                      text={
                        <div>
                          <p>
                            Optimizing SLI hashes is an advanced process which might damage your GD project. Proceed with caution.
                          </p>
                        </div>
                      }
                      buttonLabel="Optimize"
                      buttonType="primary"
                      onConfirm={this._handleOptimizeSLI}
                      childrenRootElement="a"
                    >
                      <span>Optimize SLI hash</span>
                    </Confirm>
                  </li>
                  <li>
                    <Confirm
                      title="Reset Project"
                      text={
                        <div>
                          <p>
                            You are about to create a new GoodData project for the writer {writer.get('id')}.
                            {' '}The current GoodData project ({this.state.pid}) will be discarded.
                            {' '}Are you sure you want to reset the project?
                          </p>
                        </div>
                      }
                      buttonLabel="Reset"
                      onConfirm={this._handleProjectReset}
                      childrenRootElement="a"
                    >
                      <span>Reset Project</span>
                    </Confirm>
                  </li>
                </DropdownButton>
              </li>
              <li>
                <Confirm
                  title="Delete Writer"
                  text={[
                    <p key="question">
                      Are you sure you want to delete the writer with its GoodData project?
                    </p>,
                    <p key="warning">
                      <i className="fa fa-exclamation-triangle" />
                      {" This is permanent and configuration can't be restored."}
                    </p>
                  ]}
                  buttonLabel="Delete"
                  onConfirm={this._handleProjectDelete}
                  childrenRootElement="a"
                >
                  {this.state.writer.get('isDeleting') ? (
                    <Loader className="fa-fw" />
                  ) : (
                    <span className="kbc-icon-cup fa-fw" />
                  )}
                  {' Delete Writer'}
                </Confirm>
              </li>
            </ul>
          )}
          <SidebarJobsContainer
            componentId="gooddata-writer"
            configId={this.state.writer.getIn(['config', 'id'])}
            limit={3}
          />
          <LatestVersions componentId="gooddata-writer" limit={3} />
        </div>
      </div>
    );
  },

  _getGoodDataLoginUrl() {
    let loginUrl = 'https://secure.gooddata.com/gdc/account/customerlogin';
    const componentUri = ComponentsStore.getComponent('gooddata-writer').get('uri');
    if (componentUri === 'https://syrup.eu-central-1.keboola.com/gooddata-writer') {
      loginUrl = 'https://keboola.eu.gooddata.com/gdc/account/customerlogin';
    }
    return loginUrl;
  },

  _handleBucketSelect(bucketId) {
    return actionCreators.toggleBucket(this.state.writer.getIn(['config', 'id']), bucketId);
  },

  _handleProjectUpload() {
    return actionCreators.uploadToGoodData(this.state.writer.getIn(['config', 'id']));
  },

  _handleProjectDelete() {
    return actionCreators.deleteWriter(this.state.writer.getIn(['config', 'id']));
  },

  _handleOptimizeSLI() {
    return actionCreators.optimizeSLIHash(
      this.state.writer.getIn(['config', 'id']),
      this.state.pid
    );
  },

  _handleProjectReset() {
    return actionCreators.resetProject(this.state.writer.getIn(['config', 'id']), this.state.pid);
  },

  _handleProjectAccessEnable() {
    return actionCreators.enableProjectAccess(
      this.state.writer.getIn(['config', 'id']),
      this.state.pid
    );
  },

  _handleProjectAccessDisable() {
    return actionCreators.disableProjectAccess(
      this.state.writer.getIn(['config', 'id']),
      this.state.writer.getIn(['config', 'project', 'id'])
    );
  },

  _renderGoodDataTokenInfo() {
    const token = this.state.writer.getIn(['config', 'project', 'authToken']);
    let labelCaption = 'None';
    let labelClass = 'default';
    if (token) {
      switch (token) {
        case GoodDataWriterTokenTypes.DEMO:
          labelCaption = 'Keboola DEMO';
          labelClass = 'warning';
          break;
        case GoodDataWriterTokenTypes.PRODUCTION:
          labelCaption = 'Keboola Production';
          labelClass = 'primary';
          break;
        default:
          labelCaption = 'Custom';
          labelClass = 'primary';
      }
    }
    return (
      <small>
        {'Auth Token: '}
        <span className={`label label-${labelClass}`}>{labelCaption}</span>
        {labelCaption === 'Custom' && <Protected>{token}</Protected>}
      </small>
    );
  },

  _renderNotFound() {
    return (
      <ComponentEmptyState>
        <p>No tables configured.</p>
        {this._renderAddNewTable()}
      </ComponentEmptyState>
    );
  },

  _renderTableRow(table, index, isDeleted = false) {
    const writerTable = this.state.tablesByBucket.get(table.get('id'));
    return (
      <TableRow
        key={index}
        table={writerTable}
        configId={this.state.configId}
        sapiTable={table}
        deleteTableFn={this._deleteTable}
        isDeleting={this.state.deletingTables.get(table.get('id'))}
        isDeleted={isDeleted}
      />
    );
  },

  _renderHeaderRow() {
    return (
      <div className="tr">
        <span className="th">
          <strong>Table name</strong>
        </span>
        <span className="th">
          <strong>GoodData title</strong>
        </span>
        <span className="th" />
      </div>
    );
  },

  _renderTablesByBucketsPanel() {
    return (
      <TablesByBucketsPanel
        renderTableRowFn={this._renderTableRow}
        renderHeaderRowFn={this._renderHeaderRow}
        filterFn={this._filterBuckets}
        searchQuery={this.state.filter}
        isTableExportedFn={this._isTableExported}
        onToggleBucketFn={this._handleBucketSelect}
        isBucketToggledFn={(bucketId) => {
          return this.state.writer.getIn(['bucketToggles', bucketId]);
        }}
        showAllTables={false}
        isTableShownFn={this._isTableShown}
        configuredTables={this.state.tablesByBucket.keySeq().toJS()}
        renderDeletedTableRowFn={(table, index) => {
          return this._renderTableRow(table, index, true);
        }}
      />
    );
  },

  _filterBuckets(buckets) {
    return buckets.filter(function(bucket) {
      return ['out', 'in'].includes(bucket.get('stage'));
    });
  },

  _isTableExported(tableId) {
    return this.state.tablesByBucket.find(
      (table) => table.get('id') === tableId && table.getIn(['data', 'export'])
    );
  },

  _isTableShown(tableId) {
    return this.state.tablesByBucket.find((table) => table.get('id') === tableId);
  },

  _deleteTable(tableId) {
    return actionCreators.deleteTable(this.state.configId, tableId);
  },

  _updateLocalState(path, data) {
    const newState = this.state.localState.setIn(path, data);
    return installedComponentsActions.updateLocalState(
      'gooddata-writer',
      this.state.configId,
      newState,
      path
    );
  }
});
