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
import {Link} from 'react-router/lib';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';

const MIGRATION_COMPONENT_ID = 'keboola.config-migration-tool';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore)],

  getStateFromStores() {
    return {
      components: InstalledComponentsStore.getAll()
    };
  },

  getInitialState() {
    return {
      isLoading: true,
      isMigrating: false,
      isButtonEnabled: true
    };
  },

  componentDidMount() {
    this.updateLastJob();
    this.timerID = setInterval(
      () => this.updateLastJob(),
      10000
    );
  },

  componentWillUnmount() {
    clearInterval(this.timerID);
  },

  updateLastJob() {
    this.setState({isLoading: true});
    this.fetchLastMigrationJob()
      .then(job => {
        const isMigrating = this.state.isMigrating;

        this.setState({
          job: job,
          isLoading: false,
          isMigrating: (!!job) ? !job.get('isFinished') : isMigrating
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
          {this.state.isLoading ? <Loader /> : ''}
          &nbsp;
          <small>
            Last Job: N/A
          </small>
        </div>
      );
    }

    return (
      <div>
        {this.state.isLoading ? <Loader /> : ''}
        &nbsp;
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
    if (this.state.isMigrating) {
      return (
        <span>
          <Loader />
          &nbsp;Migration in progress
        </span>
      );
    }

    return (
      <MigrationButton
        key="migration-button"
        onClick={this.onMigrate}
        enabled={!!configurationsFlatten.count() && this.state.isButtonEnabled}
      />
    );
  },

  renderRows(components, configurationsFlatten) {
    if (!configurationsFlatten.count()) {
      return <SplashIcon icon="kbc-icon-cup" label="No configurations need migration" />;
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

  onMigrate() {
    const configurations = this.getConfigurationsToMigrateAll(this.getComponentsWithOAuth());

    this.setState({
      isMigrating: true,
      isButtonEnabled: false
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
      .then(() => this.setState({
        isButtonEnabled: true
      }))
      .catch((error) => {
        throw error;
      });
  }
});
