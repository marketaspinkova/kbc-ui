import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import SplashIcon from '../../../../react/common/SplashIcon';
import MigrationComponentRow from '../components/MigrationComponentRow';
import OAuthStore from '../../../oauth-v2/Store';
import MigrationButton from '../components/MigrationButton';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import jobsApi from '../../../jobs/JobsApi';
import {fromJS, List} from 'immutable';
import {Loader} from '@keboola/indigo-ui';
// import date from '../../../../utils/date';
import {Link} from 'react-router/lib';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';

const MIGRATION_COMPONENT_ID = 'keboola.config-migration-tool';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore)],

  getStateFromStores() {
    return {
      components: InstalledComponentsStore.getAll(),
      isLoading: true,
      isMigrating: false
    };
  },

  componentDidMount() {
    this.fetchLastMigrationJob().then((job) => {
      this.setState({
        job: job,
        isLoading: false,
        isMigrating: !job.get('isFinished')
      });
    });
  },

  fetchLastMigrationJob() {
    const jobQuery = `params.component:${MIGRATION_COMPONENT_ID}`;
    return jobsApi.getJobsParametrized(jobQuery, 10, 0).then((result) => {
      const jobs = result ? fromJS(result) : List();
      return jobs.find((j) => j.hasIn(['params', 'configData', 'parameters', 'oauth']));
    });
  },

  renderJobInfo() {
    const {job} = this.state;
    if (!job) {
      return (
        <div>
          <small>
            Last Job: N/A
          </small>
        </div>
      );
    }

    return (
      <div>
        <strong>Last migration job: {' '}</strong>
        <Link to="jobDetail" params={{jobId: job.get('id')}}>
          {job.get('id')}
        </Link>
        {'  '}
        <JobStatusLabel status={job.get('status')} />
      </div>
    );
  },

  render() {
    const components = this.getComponentsWithOAuth();
    const configurationsToMigrateFlatten = this.getConfigurationsToMigrateAll(components);

    return (
      <div className="container-fluid">
        <div className="kbc-main-content kbc-components-list">
          <div className="kbc-header">
            <div className="jumbotron">
              <h2>OAuth Credentials Migration</h2>
              <p>As we have introduced new version of our OAuth API, it is necessary to migrate configurations using OAuth authorization to this new API version.</p>
              <p>By clicking button below, all of the affected configurations will be migrated.</p>
              <hr />
              <div className="row">
                <div className="col-md-5">
                  {this.renderButton(components, configurationsToMigrateFlatten)}
                </div>
                <div className="col-md-7 text-right">
                  {this.renderJobInfo()}
                </div>
              </div>
            </div>
          </div>
          {this.renderRows(components, configurationsToMigrateFlatten)}
        </div>
      </div>
    );
  },

  renderButton(components, configurationsFlatten) {
    if (this.state.isLoading) {
      return (
        <span>
          <Loader />
          &nbsp;Checking migration status
        </span>
      );
    }

    if (this.state.isMigrating) {
      return (
        <span>
          <Loader />
          &nbsp;Migration is under way
        </span>
      );
    }

    return (
      <MigrationButton
        key="migration-button"
        onClick={this.getOnMigrateFn(components)}
        enabled={!!configurationsFlatten.count()}
      />
    );
  },

  renderRows(components, configurationsFlatten) {
    if (!configurationsFlatten.count()) {
      return <SplashIcon icon="kbc-icon-cup" label="No configurations needs migration" />;
    }

    const componentRows = components.map(component => (
      <MigrationComponentRow
        component={component}
        configurations={this.getConfigurationsToMigrate(component)}
        key={component.id}
      />
    )).toArray();

    return (
      <div className="row">
        <div className="col-md-12">
          <h4>Affected configurations:</h4>
        </div>
        {componentRows}
      </div>
    );
  },

  getComponentsWithOAuth() {
    return this.state.components.filter(component => {
      return component.get('flags').contains('genericDockerUI-authorization');
    });
  },

  getConfigurationsToMigrate(component) {
    return component.get('configurations')
      .filter(config => {
        return (config.hasIn(['configuration', 'authorization', 'oauth_api', 'id']) &&
          config.getIn(['configuration', 'authorization', 'oauth_api', 'version']) !== 3);
      });
  },

  getConfigurationsToMigrateAll(components) {
    return components.map(component => {
      return this.getConfigurationsToMigrate(component)
        .map(config => ({
          id: config.get('id'),
          componentId: component.get('id')
        }));
    }).flatten(1);
  },

  getOnMigrateFn(components) {
    const configurations = this.getConfigurationsToMigrateAll(components);
    const indexPage = this;

    return () => {
      indexPage.setState({
        isMigrating: true,
        isLoading: true
      });

      const params = {
        method: 'run',
        component: MIGRATION_COMPONENT_ID,
        data: {
          configData: {
            parameters: {
              oauth: {
                configurations: configurations.toJS()
              }
            }
          }
        },
        notify: true
      };

      InstalledComponentsActionCreators
        .runComponent(params)
        .then(this.setState({isLoading: false}))
        .catch((error) => {
          this.setState({isLoading: false});
          throw error;
        });
    };
  }
});
