import React from 'react';
import {Map} from 'immutable';
import classnames from 'classnames';
import {Alert} from 'react-bootstrap';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

import * as storeProvisioning from '../../../storeProvisioning';
import RoutesStore from '../../../../../stores/RoutesStore';
import VersionsStore from '../../../../components/stores/VersionsStore';

import QueryTable from './QueryTable';
import CreateQueryElement from '../../components/CreateQueryElement';
import MigrateToRowsButton from '../../components/MigrateToRowsButton';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import SidebarVersions from '../../../../components/react/components/SidebarVersionsWrapper';

import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';

import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';

import {Loader} from '@keboola/indigo-ui';
import {SearchBar} from '@keboola/indigo-ui';
import * as actionsProvisioning from '../../../actionsProvisioning';
import LastUpdateInfo from '../../../../../react/common/LastUpdateInfo';

import {Link, Navigation} from 'react-router';

import Quickstart from '../../components/Quickstart';
import AsynchActionError from '../../components/AsynchActionError';

export default function(componentId) {
  const actionsCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'ExDbIndex',
    mixins: [createStoreMixin(VersionsStore, storeProvisioning.componentsStore), Navigation],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    componentDidMount() {
      // fetch sourceTable info if not done already
      if (!this.state.hasConnectionBeenTested || !this.state.sourceTables) {
        return actionsProvisioning.loadSourceTables(componentId, this.state.configId);
      }
    },

    getStateFromStores() {
      const config = RoutesStore.getRouterState().getIn(['params', 'config']);
      const ExDbStore = storeProvisioning.createStore(componentId, config);
      const queries = ExDbStore.getQueries();
      const credentials = ExDbStore.getCredentials();
      const enabledQueries = queries.filter(function(query) {
        return query.get('enabled');
      });
      const hasValidCredentials = ExDbStore.hasValidCredentials(credentials);
      return {
        configId: config,
        versions: VersionsStore.getVersions(componentId, config),
        pendingActions: ExDbStore.getQueriesPendingActions(),
        hasCredentials: hasValidCredentials,
        newCredentials: ExDbStore.getNewCredentials(),
        sourceTables: ExDbStore.getSourceTables(),
        queries: queries,
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        hasEnabledQueries: enabledQueries.count() > 0,
        validConnection: ExDbStore.isConnectionValid(),
        isTestingConnection: ExDbStore.isTestingConnection(),
        hasConnectionBeenTested: ExDbStore.hasConnectionBeenTested(),
        localState: ExDbStore.getLocalState(),
        isRowConfiguration: ExDbStore.isRowConfiguration()
      };
    },

    handleCredentialsSetup() {
      actionsCreators.updateEditingCredentials(this.state.configId, this.state.newCredentials);
      this.transitionTo(
        'ex-db-generic-' + componentId + '-credentials',
        {config: this.state.configId}
      );
    },

    handleFilterChange(query) {
      return actionsCreators.setQueriesFilter(this.state.configId, query);
    },

    handleRefreshSourceTables() {
      return actionsProvisioning.reloadSourceTables(componentId, this.state.configId);
    },

    handleDismissMigrationAlert() {
      return actionsCreators.dismissMigrationAlert(this.state.configId);
    },

    renderNewQueryLink() {
      return (
        <CreateQueryElement
          isNav={false}
          configurationId={this.state.configId}
          componentId={componentId}
          actionsProvisioning={actionsProvisioning}
        />
      );
    },

    renderCredentialsSetup() {
      if (!this.state.hasCredentials) {
        return (
          <div className="row component-empty-state text-center">
            <p>Please setup database credentials for this extractor</p>
            <button
              className="btn btn-success"
              onClick={this.handleCredentialsSetup}
            >Setup Database Credentials</button>
          </div>
        );
      }
    },

    renderQueriesMain() {
      if (this.state.queries.count() > 0) {
        if (this.state.queriesFiltered.count() > 0) {
          return (
            <QueryTable
              queries={this.state.queriesFiltered}
              configurationId={this.state.configId}
              componentId={componentId}
              pendingActions={this.state.pendingActions}
              isRowConfiguration={this.state.isRowConfiguration}
            />
          );
        } else {
          return (
            <div className="table table-striped">
              <div className="tfoot">
                <div className="tr">
                  <div className="td">
                    No tables found
                  </div>
                </div>
              </div>
            </div>
          );
        }
      } else if (
        actionsProvisioning.componentSupportsSimpleSetup(componentId)
        && this.state.hasCredentials
        && !this.state.localState.getIn(storeProvisioning.SOURCE_TABLES_ERROR_PATH)
      ) {
        return (
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border text-center">
            <Quickstart
              componentId={componentId}
              configId={this.state.configId}
              isLoadingSourceTables={this.state.localState.getIn(storeProvisioning.LOADING_SOURCE_TABLES_PATH) || false}
              isTestingConnection={this.state.localState.getIn(storeProvisioning.TESTING_CONNECTION_PATH) || false}
              validConnection={this.state.localState.getIn(storeProvisioning.CONNECTION_VALID_PATH) || false}
              sourceTables={this.state.localState.getIn(storeProvisioning.SOURCE_TABLES_PATH)}
              sourceTablesError={this.state.localState.getIn(storeProvisioning.SOURCE_TABLES_ERROR_PATH)}
              quickstart={this.state.localState.get('quickstart') || Map()}
              onChange={actionsCreators.quickstartSelected}
              onSubmit={actionsCreators.quickstart}
              refreshMethod={this.handleRefreshSourceTables}
            />
          </div>
        );
      } else if (this.state.hasCredentials) {
        return (
          <div className="row component-empty-state text-center">
            <p>There are no tables configured yet.</p>
            {this.renderNewQueryLink()}
          </div>
        );
      }
    },

    renderCredentialsLink() {
      if (this.state.hasCredentials) {
        const link = 'ex-db-generic-' + componentId + '-credentials';
        if (this.state.isTestingConnection) {
          return (
            <li>
              <Link to={link} params={{config: this.state.configId}}>
                <Loader className="fa-fw"/> Database Credentials
              </Link>
            </li>
          );
        } else {
          return (
            <li>
              <Link to={link} params={{ config: this.state.configId }}>
                <i className="fa fa-fw fa-user"/> Database Credentials
              </Link>
            </li>
          );
        }
      }
    },

    renderAsynchError() {
      if (this.state.localState.getIn(storeProvisioning.CONNECTION_ERROR_PATH) ||
        this.state.localState.getIn(storeProvisioning.SOURCE_TABLES_ERROR_PATH)) {
        return (
          <div className="kbc-inner-padding">
            <AsynchActionError
              componentId={componentId}
              configId={this.state.configId}
              connectionTesting={this.state.localState.getIn(storeProvisioning.TESTING_CONNECTION_PATH, false)}
              connectionError={this.state.localState.getIn(storeProvisioning.CONNECTION_ERROR_PATH)}
              sourceTablesLoading={this.state.localState.getIn(storeProvisioning.LOADING_SOURCE_TABLES_PATH, false)}
              sourceTablesError={this.state.localState.getIn(storeProvisioning.SOURCE_TABLES_ERROR_PATH)}
            />
          </div>
        );
      }
    },

    renderMigrationToRowsButton() {
      if (actionsProvisioning.componentSupportsConfigRows(componentId) && !this.state.isRowConfiguration) {
        return (
          <div className="row component-empty-state text-center">
            <p>Please migrate the configuration to the newest format to unlock the latest features.</p>
            <MigrateToRowsButton
              componentId={componentId}
              configId={this.state.configId}
              pending={!!this.state.localState.getIn(['migration', 'pending'])}
              completed={!!this.state.localState.getIn(['migration', 'completed'])}
              actionsProvisioning={actionsProvisioning}
            />
          </div>
        );
      } else if (actionsProvisioning.componentSupportsConfigRows(componentId) &&
        !!this.state.localState.getIn(['migration', 'completed'])) {
        return (
          <div className="row component-empty-state text-center">
            <Alert bsStyle="success" closeLabel="X" onDismiss={this.handleDismissMigrationAlert}>
              The configuration has been successfully migrated.
            </Alert>
          </div>
        );
      }
    },

    render() {
      const configurationId = this.state.configId;
      return (
        <div className="container-fluid">
          <div className="col-md-9 kbc-main-content">
            <div className="row kbc-header">
              <div>
                <ComponentDescription
                  componentId={componentId}
                  configId={this.state.configId}
                />
              </div>
            </div>
            {this.renderCredentialsSetup()}
            {this.renderMigrationToRowsButton()}
            {this.renderAsynchError()}
            {
              this.state.queries.count() > 0 ? (
                <div className="row-searchbar">
                  <SearchBar
                    onChange={this.handleFilterChange}
                    query={this.state.queriesFilter}
                    additionalActions={this.renderNewQueryLink()}
                  />
                </div>
              ) : null
            }
            {this.renderQueriesMain()}
          </div>
          <div className="col-md-3 kbc-main-sidebar">
            <div className="kbc-buttons kbc-text-light">
              <ComponentMetadata
                componentId={componentId}
                configId={this.state.configId}
              />
              <LastUpdateInfo lastVersion={this.state.versions.get(0)}/>
            </div>
            <ul className="nav nav-stacked">
              {this.renderCredentialsLink()}
              <li className={classnames({ disabled: !this.state.hasEnabledQueries })}>
                <RunComponentButton
                  title="Run Extraction"
                  component={componentId}
                  mode="link"
                  disabled={!this.state.hasEnabledQueries}
                  disabledReason="There are no tables configured"
                  runParams={function() { return { config: configurationId }; }}
                >
                  You are about to run the extraction
                </RunComponentButton>
              </li>
              <li>
                <DeleteConfigurationButton
                  componentId={componentId}
                  configId={this.state.configId}
                />
              </li>
            </ul>
            <SidebarJobsContainer
              componentId={componentId}
              configId={this.state.configId}
              limit={3}
            />
            <SidebarVersions limit={3} componentId={componentId}/>
          </div>
        </div>
      );
    }
  });
}
