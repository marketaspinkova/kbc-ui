import React from 'react';
import {Map} from 'immutable';

// stores
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import ComponentStore from '../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import LatestJobsStore from '../../../jobs/stores/LatestJobsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storageTablesStore from '../../../components/stores/StorageTablesStore';

// actions
import {deleteCredentialsAndConfigAuth} from '../../../oauth-v2/OauthUtils';
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import AuthorizationRow from '../../../oauth-v2/react/AuthorizationRow';
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import QueriesTable from './QueriesTable';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
// import {Link} from 'react-router';
import LatestJobs from '../../../components/react/components/SidebarJobs';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';
import AccountsManagerModal from './AccountsManagerModal.jsx';
import QueryModal from './QueryModal.jsx';
import getDefaultBucket from '../../../../utils/getDefaultBucket';

import QueryTemplates from '../../templates/queryTemplates';

// CONSTS
const COMPONENT_ID = 'keboola.ex-facebook';

export default React.createClass({
  mixins: [createStoreMixin(...storeMixins, LatestJobsStore, storageTablesStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    const component = ComponentStore.getComponent(COMPONENT_ID);

    return {
      allTables: storageTablesStore.getAll(),
      latestJobs: LatestJobsStore.getJobs(COMPONENT_ID, configId),
      store: store,
      actions: actions,
      component: component,
      configId: configId,
      authorizedEmail: store.oauthCredentials.get('authorizedFor'),
      oauthCredentials: store.oauthCredentials,
      oauthCredentialsId: store.oauthCredentialsId,
      localState: store.getLocalState()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderAccountsManagerModal()}
        {this.renderQueryModal()}
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <div className="col-sm-10">
              <ComponentDescription
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </div>
            <div className="col-sm-2 kbc-buttons">
              {this.isAuthorized() ? this.renderAddQueryLink() : null}
            </div>
          </div>
          <div className="row">
            {this.renderAuthorizedInfo('col-xs-6')}
            {this.renderAccountsInfo('col-xs-6')}
          </div>
          <div className="row">
            <QueriesTable
              bucketId={getDefaultBucket('in', COMPONENT_ID, this.state.configId)}
              allTables={this.state.allTables}
              queries={this.state.store.queries}
              configId={this.state.configId}
              accounts={this.state.store.accounts}
              deleteQueryFn={()=>{}}
              onStartEdit={()=>{}}
              isPendingFn={()=>{}}
              toggleQueryEnabledFn={()=>{}}
              getRunSingleQueryDataFn={()=>{}}
            />
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            componentId={COMPONENT_ID}
            configId={this.state.configId}
          />
          <ul className="nav nav-stacked">
            <li className={!!this.invalidToRun() ? 'disabled' : null}>
              <RunComponentButton
                title="Run Extraction"
                component={COMPONENT_ID}
                mode="link"
                runParams={this.runParams()}
                disabled={!!this.invalidToRun()}
                disabledReason={this.invalidToRun()}
              >
                You are about to run extraction.
              </RunComponentButton>
            </li>
            {/* <li>
                <a href={this.state.component.get('documentationUrl')} target="_blank">
                <i className="fa fa-question-circle fa-fw" /> Documentation
                </a>
                </li> */}
        <li>
          <DeleteConfigurationButton
            componentId={COMPONENT_ID}
            configId={this.state.configId}
          />
        </li>
          </ul>
          <LatestJobs jobs={this.state.latestJobs} limit={3} />
          <LatestVersions
            limit={3}
            componentId={COMPONENT_ID}
          />
        </div>
      </div>
    );
  },

  isAuthorized() {
    return this.state.store.isAuthorized();
  },


  invalidToRun() {
    if (!this.isAuthorized()) {
      return 'No Facebook account authorized';
    }
    return false;
  },

  renderAccountsInfo(clName) {
    const {accounts} = this.state.store;
    return (
      <div className={clName}>
        <div className="form-group form-group-sm">
          <label> Pages </label>
          <button
            style={{'padding-bottom': 0, 'padding-top': 0}}
            className="btn btn-link"
            onClick={this.showAccountsManagerModal}>
            Select
            </button>
          <div className="form-control-static">
            <div>{
              accounts.map((a, accountId) =>
                a.get('name', accountId)).toArray().join(',')
           }</div>
        </div>
          </div>
      </div>
    );
  },

  showQueryModal(query) {
    const dirtyQuery = query ? query : this.state.actions.touchQuery();
    const modalData = Map()
      .set('query', dirtyQuery)
      .set('currentQuery', query);
    this.state.actions.updateLocalState(['QueryModal'], modalData);
    this.state.actions.updateLocalState('showQueryModal', true);
  },

  renderQueryModal() {
    const hideFn = () => {
      this.state.actions.updateLocalState(['QueryModal'], Map());
      this.state.actions.updateLocalState('showQueryModal', false);
    };
    return (
      <QueryModal
        queryTemplates={QueryTemplates.get(COMPONENT_ID)}
        show={this.state.localState.get('showQueryModal', false)}
        onHideFn={hideFn}
        isSavingFn={this.state.store.isSavingQuery}
        onSaveQuery={this.state.actions.saveQuery}
        accounts={this.state.store.accounts}
        {...this.state.actions.prepareLocalState('QueryModal')}
      />
    );
  },

  showAccountsManagerModal() {
    this.state.actions.loadAccounts();
    this.state.actions.updateLocalState(['AccountsManagerModal', 'selected'], this.state.store.accounts);
    this.state.actions.updateLocalState('ShowAccountsManagerModal', true);
  },

  renderAccountsManagerModal() {
    return (
      <AccountsManagerModal
        show={this.state.localState.get('ShowAccountsManagerModal', false)}
        onHideFn={() => {
          this.state.actions.updateLocalState(['AccountsManagerModal'], Map());
          this.state.actions.updateLocalState(['ShowAccountsManagerModal'], false);
        }}
        accounts={this.state.store.accounts}
        authorizedDescription={this.state.oauthCredentials.get('authorizedFor')}
        syncAccounts={this.state.store.syncAccounts}
        {...this.state.actions.prepareLocalState('AccountsManagerModal')}
        onSaveAccounts={this.state.actions.saveAccounts}
        isSaving={this.state.store.isSavingAccounts()}
      />
    );
  },

  renderAuthorizedInfo(clName) {
    return (
      <AuthorizationRow
        className={this.isAuthorized() ? clName : 'col-xs-12'}
        id={this.state.oauthCredentialsId}
        configId={this.state.configId}
        componentId={COMPONENT_ID}
        credentials={this.state.oauthCredentials}
        isResetingCredentials={false}
        onResetCredentials={this.deleteCredentials}
        showHeader={false}
      />
    );
  },

  renderAddQueryLink() {
    return (
      <button
        className="btn btn-success"
        onClick={this.showQueryModal.bind(this, null)}>
        Add Query
      </button>
    );
  },

  renderEmptyQueries() {
    return (
      this.isAuthorized() ?
      <div className="row">
        <EmptyState>
          <p>No Queries Configured</p>
          {this.renderAddQueryLink()}
        </EmptyState>
      </div>
      : null
    );
  },

  runParams() {
    return () => ({config: this.state.configId});
  },


  deleteCredentials() {
    deleteCredentialsAndConfigAuth(COMPONENT_ID, this.state.configId);
  }
});
