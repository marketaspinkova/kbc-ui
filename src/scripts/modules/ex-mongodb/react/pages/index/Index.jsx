import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Link } from 'react-router';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import { componentsStore, createStore } from '../../../storeProvisioning';
import RoutesStore from '../../../../../stores/RoutesStore';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';
import ScheduleConfigurationButton from '../../../../components/react/components/ScheduleConfigurationButton';
import SidebarJobsContainer from '../../../../components/react/components/SidebarJobsContainer';
import RunExtractionButton from '../../../../components/react/components/RunComponentButton';
import { SearchBar } from '@keboola/indigo-ui';
import { createActions } from '../../../actionsProvisioning';
import LatestVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import CreateQueryElement from '../../components/CreateQueryElement';
import QueryTable from './QueryTable';

export default function(componentId) {
  const actionCreators = createActions(componentId);

  return createReactClass({
    mixins: [createStoreMixin(componentsStore)],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    getStateFromStores() {
      const config = RoutesStore.getRouterState().getIn(['params', 'config']);
      const ExDbStore = createStore(componentId, config);
      const queries = ExDbStore.getQueries();
      const credentials = ExDbStore.getCredentials();

      // state
      return {
        configId: config,
        pendingActions: ExDbStore.getQueriesPendingActions(),
        hasCredentials: ExDbStore.hasValidCredentials(credentials),
        queries,
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        hasEnabledQueries: queries.filter(query => query.get('enabled')).count() > 0
      };
    },

    _handleFilterChange(query) {
      return actionCreators.setQueriesFilter(this.state.configId, query);
    },

    render() {
      return (
        <div className="container-fluid">
          {this.renderMainContent()}
          {this.renderSidebar()}
        </div>
      );
    },

    renderMainContent() {
      return (
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription componentId={componentId} configId={this.state.configId} />
          </div>

          {!this.state.hasCredentials && (
            <div className="row component-empty-state text-center">
              <p>Please set up database credentials for this extractor.</p>
              <Link to="ex-mongodb-credentials" params={{ config: this.state.configId }}>
                <button className="btn btn-success">Setup Database Credentials</button>
              </Link>
            </div>
          )}

          {this.state.queries.count() > 1 && (
            <div className="row-searchbar">
              <SearchBar onChange={this._handleFilterChange} query={this.state.queriesFilter} />
            </div>
          )}

          {this.renderQueryTable()}
        </div>
      );
    },

    renderQueryTable() {
      if (this.state.queries.count()) {
        if (this.state.queriesFiltered.count()) {
          return (
            <QueryTable
              queries={this.state.queriesFiltered}
              configurationId={this.state.configId}
              componentId={componentId}
              pendingActions={this.state.pendingActions}
              actionCreators={actionCreators}
            />
          );
        }

        return this._renderNotFound();
      }

      if (this.state.hasCredentials) {
        return (
          <div className="row component-empty-state text-center">
            <p>No queries configured yet.</p>
            <CreateQueryElement
              isNav={false}
              componentId={componentId}
              configurationId={this.state.configId}
              actionCreators={actionCreators}
            />
          </div>
        );
      }
    },

    renderSidebar() {
      const configurationId = this.state.configId;

      return (
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata componentId={componentId} configId={configurationId} />
          </div>
          <ul className="nav nav-stacked">
            {this.state.hasCredentials && (
              <li>
                <Link to="ex-mongodb-credentials" params={{ config: configurationId }}>
                  <i className="fa fa-fw fa-user" /> Database Credentials
                </Link>
              </li>
            )}
            <li className={classnames({ disabled: !this.state.hasEnabledQueries })}>
              <RunExtractionButton
                title="Run Extraction"
                component={componentId}
                mode="link"
                disabled={!this.state.hasEnabledQueries}
                disabledReason="There are no queries to be executed."
                runParams={() => {
                  return {
                    config: configurationId
                  };
                }}
              >
                You are about to run an extraction.
              </RunExtractionButton>
            </li>
            <li>
              <DeleteConfigurationButton componentId={componentId} configId={configurationId} />
            </li>
            <li>
              <ScheduleConfigurationButton componentId={componentId} configId={configurationId} />
            </li>
          </ul>
          <SidebarJobsContainer
            componentId={componentId}
            configId={this.state.configId}
            limit={3}
          />
          <LatestVersions limit={3} componentId={componentId} />
        </div>
      );
    },

    _renderNotFound() {
      return (
        <div className="table table-striped">
          <div className="tfoot">
            <div className="tr">
              <div className="td">No queries found</div>
            </div>
          </div>
        </div>
      );
    }
  });
}
