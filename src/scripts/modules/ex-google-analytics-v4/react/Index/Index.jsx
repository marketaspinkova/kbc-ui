import React from 'react';
import {Map} from 'immutable';
// stores
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import ComponentStore from '../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

// actions
import {deleteCredentialsAndConfigAuth} from '../../../oauth-v2/OauthUtils';
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import AuthorizationRow from '../../../oauth-v2/react/AuthorizationRow';
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import {Link} from 'react-router';
import {ExternalLink} from '@keboola/indigo-ui';
import ProfileInfo from '../ProfileInfo';
import SidebarJobsContainer from '../../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';

// index components
import QueriesTable from './QueriesTable';
import ProfilesManagerModal from './ProfilesManagerModal';

export default function(componentId) {
  return React.createClass({
    mixins: [createStoreMixin(...storeMixins)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const store = storeProvisioning(configId, componentId);
      const actions = actionsProvisioning(configId, componentId);
      const component = ComponentStore.getComponent(componentId);

      return {
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
          <ProfilesManagerModal
            show={!!this.state.localState.getIn(['ProfilesManagerModal', 'profiles'], false)}
            onHideFn={() => this.state.actions.updateLocalState('ProfilesManagerModal', Map())}
            profiles={this.state.store.profiles}
            isSaving={this.state.store.isSaving('profiles')}
            authorizedEmail={this.state.authorizedEmail}
            onSaveProfiles={(newProfiles) => this.state.actions.saveProfiles(newProfiles)}
            {...this.state.actions.prepareLocalState('ProfilesManagerModal')}
          />
          <div className="col-md-9 kbc-main-content">

            <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
              <ComponentDescription
                componentId={componentId}
                configId={this.state.configId}
              />
            </div>
            <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
              <AuthorizationRow
                id={this.state.oauthCredentialsId}
                configId={this.state.configId}
                componentId={componentId}
                credentials={this.state.oauthCredentials}
                isResetingCredentials={false}
                onResetCredentials={this.deleteCredentials}
                showHeader={false}
              />
            </div>

            {this.renderProfiles()}

            {this.hasQueries()
              ? this.renderQueriesTable()
              : this.renderEmptyQueries()
            }
          </div>
          <div className="col-md-3 kbc-main-sidebar">
            <ComponentMetadata
              componentId={componentId}
              configId={this.state.configId}
            />
            <ul className="nav nav-stacked">
              <li className={!!this.invalidToRun() ? 'disabled' : null}>
                <RunComponentButton
                  title="Run"
                  component={componentId}
                  mode="link"
                  runParams={this.runParams()}
                  disabled={!!this.invalidToRun()}
                  disabledReason={this.invalidToRun()}
                >
                  You are about to run the component.
                </RunComponentButton>
              </li>
              {this.hasProfiles() ?
                <li>
                  <a
                    onClick={this.showProfilesModal}>
                    <i className="fa fa-fw fa-globe" />
                    {' '}
                    Setup Profiles
                  </a>
                </li>
                : null }
              <li>
                <ExternalLink href={this.state.component.get('documentationUrl')}>
                  <i className="fa fa-question-circle fa-fw" /> Documentation
                </ExternalLink>
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
            <LatestVersions
              limit={3}
              componentId={componentId}
            />
          </div>
        </div>

      );
    },

    showProfilesModal() {
      return this.state.actions.updateLocalState(['ProfilesManagerModal', 'profiles'], this.state.store.profiles);
    },

    isAuthorized() {
      return this.state.store.isAuthorized();
    },

    hasProfiles() {
      return this.state.store.profiles.count() > 0;
    },

    hasQueries() {
      return this.state.store.queries && this.state.store.queries.count() > 0;
    },

    invalidToRun() {
      if (!this.isAuthorized()) {
        return 'No Google Analytics account authorized';
      }

      if (!this.hasProfiles()) {
        return 'No Profiles Available';
      }

      if (!this.hasQueries()) {
        return 'No queries configured';
      }

      return '';
    },

    renderProfiles() {
      const showThreshold = 2;
      const {profiles} = this.state.store;
      const showMoreCount = profiles.count() - showThreshold;

      if (this.isAuthorized() || this.hasProfiles()) {
        return (
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <div className="form-group form-group-sm">
              <label> Registered Profiles </label>
              {this.hasProfiles() ?
                <div className="form-control-static">
                  {profiles.take(showThreshold).map(
                    (p, index) => <div key={index}><ProfileInfo profile={p} /></div>
                  )}
                  <div>
                    {showMoreCount > 0 ?
                      <a
                        onClick={this.showProfilesModal}>
                        and {showMoreCount} more
                      </a>
                      : null
                    }
                  </div>
                </div>
                :
                <EmptyState>
                  <p> No profiles selected </p>
                  <button type="button" className="btn btn-success"
                    onClick={this.showProfilesModal}>
                    Select Profiles
                  </button>
                </EmptyState>
              }
            </div>
          </div>

        );
      }
      return null;
    },

    renderQueriesTable() {
      return (
        <div>
          <div className="kbc-inner-padding text-right">
            {this.renderAddQueryLink()}
          </div>
          <QueriesTable
            outputBucket={this.state.store.outputBucket}
            deleteQueryFn={this.state.actions.deleteQuery}
            toggleQueryEnabledFn={this.state.actions.toggleQueryEnabled}
            getRunSingleQueryDataFn={this.state.store.getRunSingleQueryData}
            isPendingFn={this.state.store.isPending}
            queries={this.state.store.queries}
            allProfiles={this.state.store.profiles}
            configId={this.state.configId}
            componentId={componentId}
            {...this.state.actions.prepareLocalState('QueriesTable')}
          />
        </div>
      );
    },
    renderAddQueryLink() {
      return (
        <Link
          to={componentId + '-new-query'}
          params={{config: this.state.configId}}
          className="btn btn-success">
          <i className="kbc-icon-plus"/>New Query
        </Link>
      );
    },

    renderEmptyQueries() {
      return (
        this.hasProfiles() && this.isAuthorized() ?
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
      deleteCredentialsAndConfigAuth(componentId, this.state.configId);
    }

  });
}
