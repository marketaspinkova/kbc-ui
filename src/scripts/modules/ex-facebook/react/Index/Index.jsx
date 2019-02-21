import React from 'react';
import {Map} from 'immutable';

// stores
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import ComponentStore from '../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
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
import {ExternalLink} from '@keboola/indigo-ui';
import SidebarJobsContainer from '../../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';
import AccountsManagerModal from './AccountsManagerModal.jsx';
import QueryModal from './QueryModal.jsx';
import ApiVersionModal from './ApiVersionModal';
import getDefaultBucket from '../../../../utils/getDefaultBucket';
import AccountLink from './AccountLink';

import QueryTemplates from '../../templates/queryTemplates';
import placeholderTemplates from '../../templates/placeholderTemplates';
import accountDescriptionTemplate from '../../templates/accountDescription';

export default function(COMPONENT_ID) {
  const getAccountDesc = accountDescriptionTemplate(COMPONENT_ID);
  return React.createClass({
    mixins: [createStoreMixin(...storeMixins, storageTablesStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const store = storeProvisioning(COMPONENT_ID, configId);
      const actions = actionsProvisioning(COMPONENT_ID, configId);
      const component = ComponentStore.getComponent(COMPONENT_ID);

      return {
        allTables: storageTablesStore.getAll(),
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
          {this.renderApiVersionModal()}
          <div className="col-md-9 kbc-main-content">
            <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
              <ComponentDescription
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </div>
            <div className="row">
              {this.renderAuthorizedInfo('col-xs-6')}
              {this.isAuthorized() ? this.renderApiVersionEdit('col-xs-6') : null}
            </div>
            {
              this.isAuthorized() || this.state.store.hasAccounts ?
                <div className="row">
                  {this.renderAccountsInfo('col-xs-12')}
                </div>
                : null
            }
            {
              (this.isAuthorized() && this.state.store.hasAccounts) || this.state.store.hasQueries ?
                <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
                  {this.state.store.hasQueries ?
                    <QueriesTable
                      componentId={COMPONENT_ID}
                      bucketId={getDefaultBucket('in', COMPONENT_ID, this.state.configId)}
                      allTables={this.state.allTables}
                      queries={this.state.store.queries}
                      configId={this.state.configId}
                      accounts={this.state.store.accounts}
                      deleteQueryFn={this.state.actions.deleteQuery}
                      onStartEdit={this.showQueryModal}
                      isPendingFn={this.state.store.isPending}
                      toggleQueryEnabledFn={this.state.actions.toggleQueryEnabledFn}
                      getRunSingleQueryDataFn={this.state.store.getRunSingleQueryData}
                      accountDescFn={getAccountDesc}
                      addQueryButton={this.renderAddQueryLink()}
                    />
                    :
                    this.renderEmptyQueries()
                  }
                </div>
                : null
            }
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
                  You are about to run an extraction.
                </RunComponentButton>
              </li>
              <li>
                <ExternalLink href={this.state.component.get('documentationUrl')}>
                  <i className="fa fa-question-circle fa-fw" /> Documentation
                </ExternalLink>
              </li>
              <li>
                <DeleteConfigurationButton
                  componentId={COMPONENT_ID}
                  configId={this.state.configId}
                />
              </li>
            </ul>
            <SidebarJobsContainer
              componentId={COMPONENT_ID}
              configId={this.state.configId}
              limit={3}
            />
            <LatestVersions
              limit={3}
              componentId={COMPONENT_ID}
            />
          </div>
        </div>
      );
    },

    showApiVersionModal() {
      const initState = Map({version: this.state.store.version});
      this.state.actions.updateLocalState('ApiVersionModal', initState);
      this.state.actions.updateLocalState('ShowApiVersionModal', true);
    },

    renderApiVersionModal() {
      const hideFn = () => {
        this.state.actions.updateLocalState('ShowApiVersionModal', false);
        this.state.actions.updateLocalState('ApiVersionModal', Map());
      };

      return (
        <ApiVersionModal
          show={this.state.localState.get('ShowApiVersionModal', false)}
          currentVersion={this.state.store.version}
          defaultVersion={this.state.store.DEFAULT_API_VERSION}
          onHide={hideFn}
          isSaving={this.state.store.isPending('version')}
          onSave={this.state.actions.saveApiVersion}
          {...this.state.actions.prepareLocalState('ApiVersionModal')}
        />
      );
    },

    renderApiVersionEdit(clName) {
      return (
        <div className={clName}>
          <span> Facebook Api Version </span>
          <span
            onClick={this.showApiVersionModal}
            className="kbc-inline-edit-link">
            <span>{this.state.store.version}</span>
            <span className="kbc-icon-pencil" />
          </span>
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
      const showTreshold = 10;
      const showMorecount = accounts.count() - showTreshold;
      if (this.state.store.hasAccounts) {
        return (
          <div className={clName}>
            <span>Selected {getAccountDesc('Facebook Pages')}</span>
            <a
              style={{paddingBottom: 0, paddingTop: 0}}
              className="btn btn-link btn-sm"
              onClick={this.showAccountsManagerModal}>
              Modify
            </a>
            <div>
              {
                accounts.take(showTreshold).map((a, index) => {
                  return (
                    <span key={index}>
                      <AccountLink account={a} componentId={COMPONENT_ID}/>{' '}
                    </span>
                  );
                }).toArray()
              }
              { showMorecount > 0 ?
                <span>
                  <a className="btn btn-link"
                    onClick={this.showAccountsManagerModal}>
                    {' '}and {showMorecount} more
                  </a>
                </span>
                : null
              }
            </div>
          </div>
        );
      } else {
        return (
          <EmptyState>
            <p>No {getAccountDesc('Facebook Pages')} Selected</p>
            <button
              className="btn btn-success"
              onClick={this.showAccountsManagerModal}>
              Select {getAccountDesc('Pages')}
            </button>
          </EmptyState>
        );
      }
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
          apiVersion={this.state.store.version}
          helpUrl={this.state.component.get('documentationUrl')}
          placeholders={placeholderTemplates[COMPONENT_ID]}
          queryTemplates={QueryTemplates.get(COMPONENT_ID)}
          show={this.state.localState.get('showQueryModal', false)}
          onHideFn={hideFn}
          isSavingFn={this.state.store.isSavingQuery}
          onSaveQuery={this.state.actions.saveQuery}
          accounts={this.state.store.accounts}
          accountDescFn={getAccountDesc}
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
          onHideFn={
            () => {
              this.state.actions.updateLocalState(['AccountsManagerModal'], Map());
              this.state.actions.updateLocalState(['ShowAccountsManagerModal'], false);
            }
          }
          accounts={this.state.store.accounts}
          authorizedDescription={this.state.oauthCredentials.get('authorizedFor')}
          syncAccounts={this.state.store.syncAccounts}
          {...this.state.actions.prepareLocalState('AccountsManagerModal')}
          onSaveAccounts={this.state.actions.saveAccounts}
          isSaving={this.state.store.isSavingAccounts()}
          accountDescFn={getAccountDesc}
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
          <i className="kbc-icon-plus"/>New Query
        </button>
      );
    },

    renderEmptyQueries() {
      if (!this.isAuthorized()) {
        return null;
      }

      return (
        <EmptyState>
          <p>No Queries Configured</p>
          {this.renderAddQueryLink()}
        </EmptyState>
      );
    },

    runParams() {
      return () => ({config: this.state.configId});
    },


    deleteCredentials() {
      deleteCredentialsAndConfigAuth(COMPONENT_ID, this.state.configId);
    }
  });
}
