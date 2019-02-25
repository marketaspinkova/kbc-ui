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
import {Link} from 'react-router';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import date from '../../../../utils/date';
import {Col, Jumbotron, Row} from 'react-bootstrap';
import oAuthMigration from '../../../components/utils/oAuthMigration';

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

  render() {
    const components = this.getComponentsWithOAuth();
    const affectedComponents = oAuthMigration.getComponentsToMigrate(components);
    const ignoredComponents = oAuthMigration.getIgnoredComponents(components);
    const configurationsToMigrateFlatten = oAuthMigration.getConfigurationsFlatten(affectedComponents);
    const ignoredConfigurationsFlatten = oAuthMigration.getConfigurationsFlatten(ignoredComponents);

    return (
      <div className="container-fluid">
        <div className="kbc-main-content kbc-components-list">
          <Jumbotron>
            <h2>OAuth Credentials Migration</h2>
            <p>As we have introduced new version of our OAuth Broker API, it is necessary to migrate configurations using OAuth authorization to this new version.</p>
            <p>By clicking button below, all of the affected configurations will be migrated.</p>
            <hr />
            <Row>
              <Col md={5}>
                {this.renderButton(configurationsToMigrateFlatten)}
              </Col>
              <Col md={7} className="text-right">
                {this.renderJobInfo()}
              </Col>
            </Row>
          </Jumbotron>
          {this.renderConfigurationsList(
            affectedComponents,
            ignoredComponents,
            configurationsToMigrateFlatten,
            ignoredConfigurationsFlatten
          )}
        </div>
      </div>
    );
  },

  renderButton(configurationsFlatten) {
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

  renderJobInfo() {
    const {job} = this.state;
    if (!job) {
      return (
        <div>
          {this.state.isLoading && <Loader />}
          &nbsp;
          <small>
            Last Job: N/A
          </small>
        </div>
      );
    }

    return (
      <div>
        {this.state.isLoading && <Loader />}
        &nbsp;
        <strong>Last migration job: {' '}</strong>
        <Link to="jobDetail" params={{jobId: job.get('id')}}>
          {date.format(job.get('createdTime'))}
        </Link>
        {'  '}
        <JobStatusLabel status={job.get('status')} />
      </div>
    );
  },

  renderConfigurationsList(
    affectedComponents,
    ignoredComponents,
    configurationsToMigrateFlatten,
    ignoredConfigurationsFlatten
  ) {
    if (!ignoredConfigurationsFlatten.count() && !configurationsToMigrateFlatten.count()) {
      return (<SplashIcon icon="kbc-icon-cup" label="No configurations need migration" />);
    }

    const ignored = ignoredConfigurationsFlatten.count()
      ? this.renderIgnored(ignoredComponents)
      : null;

    const affected = configurationsToMigrateFlatten.count()
      ? this.renderAffected(affectedComponents)
      : null;

    return [
      affected,
      ignored
    ];
  },

  renderAffected(components) {
    return [
      <div key="header" className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <h2>Affected configurations</h2>
      </div>,
      this.renderRows(components)
    ];
  },

  renderIgnored(components) {
    return [
      <div key="info" className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <h2>Manual migration needed!</h2>
        <p>The configurations below need to be migrated manually. Please open each configuration and reset the authorization to migrate.</p>
      </div>,
      this.renderRows(components)
    ];
  },

  renderRows(components) {
    return components.map(component => (
      <MigrationComponentRow
        component={component}
        configurations={oAuthMigration.getConfigurationsToMigrate(component)}
        key={component.id}
      />
    )).toArray();
  },

  getComponentsWithOAuth() {
    return this.state.components.filter(component => {
      return component.get('flags').contains('genericDockerUI-authorization') || component.get('id') === 'tde-exporter';
    });
  },

  onMigrate() {
    const configurations = oAuthMigration.getConfigurationsFlatten(
      oAuthMigration.getComponentsToMigrate(this.getComponentsWithOAuth())
    );

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
