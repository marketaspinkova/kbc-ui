import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { Map } from 'immutable';
import SoundNotifications from '../../../../../utils/SoundNotifications';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import JobsStore from '../../../stores/JobsStore';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import ConfigurationRowsStore from '../../../../configurations/ConfigurationRowsStore';
import TransformationsStore from '../../../../transformations/stores/TransformationsStore';
import PureRendererMixin from 'react-immutable-render-mixin';
import { fromJS } from 'immutable';

import Events from '../../../../sapi-events/react/Events';
import ComponentName from '../../../../../react/common/ComponentName';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import Duration from '../../../../../react/common/Duration';
import JobRunId from '../../../../../react/common/JobRunId';
import JobStatsContainer from './JobStatsContainer';
import GoodDataStatsContainer from './GoodDataStatsContainer';
import { PanelGroup, Panel } from 'react-bootstrap';
import getComponentId from '../../../getJobComponentId';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';

import ComponentConfigurationLink from '../../../../components/react/components/ComponentConfigurationLink';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';

import contactSupport from '../../../../../utils/contactSupport';

import date from '../../../../../utils/date';
import { Tree, NewLineToBr } from '@keboola/indigo-ui';

const APPLICATION_ERROR = 'application';

export default React.createClass({
  mixins: [
    createStoreMixin(JobsStore, InstalledComponentsStore, ConfigurationRowsStore, TransformationsStore),
    PureRendererMixin
  ],

  getStateFromStores() {
    const job = JobsStore.get(RoutesStore.getCurrentRouteIntParam('jobId'));

    let configuration = Map();
    if (job && job.hasIn(['params', 'config'])) {
      const config = job.getIn(['params', 'config'], '');
      configuration = InstalledComponentsStore.getConfig(getComponentId(job), config.toString());
    }

    return {
      job,
      query: JobsStore.getQuery(),
      configuration
    };
  },

  getInitialState() {
    const job = JobsStore.get(RoutesStore.getCurrentRouteIntParam('jobId'));
    let activeAccordion = 'stats';
    if (job.get('component') === 'gooddata-writer') {
      activeAccordion = 'gdresults';
    }
    return { activeAccordion };
  },

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.job) {
      return;
    }
    const currentStatus = this.state.job.get('status');
    const prevStatus = prevState.job.get('status');
    if (currentStatus === prevStatus) {
      return;
    }
    switch (currentStatus) {
      case 'success':
        return SoundNotifications.success();
      case 'error':
      case 'cancelled':
      case 'canceled':
      case 'terminated':
        return SoundNotifications.crash();
      default:
        break;
    }
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
  },

  _handleChangeActiveAccordion(activeKey) {
    this.setState({
      activeAccordion: activeKey === this.state.activeAccordion ? '' : activeKey
    });
  },

  render() {
    const { job } = this.state;

    if (!job) {
      return null;
    }

    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this._renderGeneralInfoRow(job)}
          {this._renderRunInfoRow(job)}
          {job.get('status') === 'error' && this._renderErrorResultRow(job)}
          {this._renderAccordion(job)}
          {this._renderLogRow(job)}
        </div>
      </div>
    );
  },

  _renderErrorDetails(job) {
    let message;
    const exceptionId = job.getIn(['result', 'exceptionId']);
    const parts = [];
    const componentId = getComponentId(job);
    if (job.get('error') === APPLICATION_ERROR) {
      message = 'Internal Error';
    } else {
      message = job.getIn(['result', 'message']);
    }

    if (
      job.hasIn(['result', 'context', 'configurationId']) &&
      job.hasIn(['result', 'context', 'rowId']) &&
      job.hasIn(['result', 'context', 'queryNumber']) &&
      job.hasIn(['result', 'context', 'query'])
    ) {
      message = job.getIn(['result', 'message']);
      if (message.match(/Executing query #(\d*) failed:/)) {
        const matches = message.match(/Executing query #(\d*) failed:/);
        message = message.substr(matches.index + matches[0].length);
      }
      parts.push(
        <p key="transformationlink">
          {'Transformation '}
          <ComponentConfigurationRowLink
            componentId={componentId}
            configId={job.getIn(['result', 'context', 'configurationId'])}
            rowId={job.getIn(['result', 'context', 'rowId']).toString()}
          >
            {job.getIn(['result', 'context', 'rowName'])}
          </ComponentConfigurationRowLink>
          {' has failed'}
        </p>
      );
      parts.push(
        <div key="transformationerror" style={{ marginTop: '10px' }}>
          <strong>Error</strong>
          <div style={{ marginTop: '5px' }}>
            <NewLineToBr text={message} />
          </div>
        </div>
      );
      parts.push(
        <div key="transformationqueryheadline" style={{ marginTop: '10px' }}>
          <strong>
            {'Query '}
            <small>
              <ComponentConfigurationRowLink
                componentId={componentId}
                configId={job.getIn(['result', 'context', 'configurationId'])}
                rowId={job.getIn(['result', 'context', 'rowId']).toString()}
                query={{ highlightQueryNumber: job.getIn(['result', 'context', 'queryNumber']) }}
              >
                <span>Open query</span>
              </ComponentConfigurationRowLink>
            </small>
          </strong>
          <div style={{ marginTop: '5px' }}>
            <pre>
              <code>
                <NewLineToBr text={job.getIn(['result', 'context', 'query'])} />
              </code>
            </pre>
          </div>
        </div>
      );
    } else {
      parts.push(
        <p key="genericerrordesc">
          <strong>
            <NewLineToBr text={message} />
          </strong>
        </p>
      );
      if (job.get('error') === APPLICATION_ERROR) {
        parts.push(
          <p key="apperror">
            {'Something is broken. '}
            {'Our developers were notified about this error. '}
            Feel free to contact support to request more information.
          </p>
        );
      }
    }

    parts.push(
      <p key="exceptionId" style={{ marginTop: '10px' }}>
        {exceptionId && <span>{`ExceptionId ${exceptionId}`}</span>}
      </p>
    );

    parts.push(
      <button
        key="contact-support-btn"
        className="btn btn-danger"
        onClick={this._contactSupport}
        style={{
          marginTop: '10px'
        }}
      >
        Contact Support
      </button>
    );
    return parts;
  },

  _renderErrorResultRow(job) {
    return (
      <div className="row row-alert">
        <div
          className="alert alert-danger"
          style={{
            marginBottom: 0,
            paddingLeft: '50px',
            paddingTop: '20px',
            paddingBottom: '20px'
          }}
        >
          {this._renderErrorDetails(job)}
        </div>
      </div>
    );
  },

  _renderConfigurationLink(job) {
    let componentId = getComponentId(job);
    let configId = this.state.configuration.get('id');

    if (this.state.configuration.count()) {
      return (
        <span>
          <ComponentConfigurationLink componentId={componentId} configId={configId}>
            {this.state.configuration.get('name', configId)}
          </ComponentConfigurationLink>
        </span>
      );
    }

    if (job.get('component') === 'provisioning') {
      if (job.hasIn(['params', 'transformation', 'config_id'])) {
        configId = job.getIn(['params', 'transformation', 'config_id']);

        return (
          <span>
            <ComponentConfigurationLink componentId="transformation" configId={configId}>
              {InstalledComponentsStore.getConfig('transformation', configId).get('name', configId)}
            </ComponentConfigurationLink>
          </span>
        );
      }

      return (
        <span>
          <Link to="sandbox">Plain Sandbox</Link>
        </span>
      );
    }

    if (job.hasIn(['params', 'config'])) {
      return <span>{job.getIn(['params', 'config'])}</span>;
    }

    return <em>N/A</em>;
  },

  _renderConfigurationRowLink(job) {
    let componentId = getComponentId(job);
    let configId = this.state.configuration.get('id');
    let rowId = job.getIn(['params', 'transformations', 0], null);
    let rowName = TransformationsStore.getTransformationName(configId, rowId);

    if (!rowId) {
      rowId = job.getIn(['params', 'row'], null);
      rowName = ConfigurationRowsStore.get(componentId, configId, rowId).get('name');
    }

    if (rowId && rowName) {
      return (
        <span>
          {' / '}
          <ComponentConfigurationRowLink componentId={componentId} configId={configId} rowId={rowId}>
            {rowName}
          </ComponentConfigurationRowLink>
        </span>
      );
    }

    if (job.hasIn(['params', 'transformation', 'config_id']) && job.hasIn(['params', 'transformation', 'row_id'])) {
      configId = job.getIn(['params', 'transformation', 'config_id']);
      rowId = job.getIn(['params', 'transformation', 'row_id']);

      return (
        <span>
          {' / '}
          <ComponentConfigurationRowLink componentId="transformation" configId={configId} rowId={rowId}>
            {InstalledComponentsStore.getConfigRow('transformation', configId, rowId).get('name', rowId)}
          </ComponentConfigurationRowLink>
        </span>
      );
    }

    if (rowId) {
      return <span>{` / ${rowId}`}</span>;
    }

    return null;
  },

  _renderRunInfoRow(job) {
    const jobStarted = () => job.get('startTime');
    const renderDate = function(pdate) {
      if (pdate) {
        return date.format(pdate);
      } else {
        return 'N/A';
      }
    };

    return (
      <div className="table kbc-table-border-vertical kbc-detail-table" style={{ marginBottom: 0 }}>
        <div className="tr">
          <div className="td">
            <div className="row">
              <span className="col-md-3">Configuration</span>
              <strong className="col-md-9">
                {this._renderConfigurationLink(job)}
                {this._renderConfigurationRowLink(job)}
                {this._renderConfigVersion(job)}
              </strong>
            </div>
            <div className="row">
              <span className="col-md-3">Created At</span>
              <strong className="col-md-9">{date.format(job.get('createdTime'))}</strong>
            </div>
            <div className="row">
              <span className="col-md-3">Start</span>
              <strong className="col-md-9">{renderDate(job.get('startTime'))}</strong>
            </div>
            <div className="row">
              <span className="col-md-3">RunId</span>
              <strong className="col-md-9">
                <JobRunId runId={job.get('runId')} />
              </strong>
            </div>
          </div>
          <div className="td">
            <div className="row">
              <span className="col-md-3">{'Status '}</span>
              <span className="col-md-9">
                <JobStatusLabel status={job.get('status')} />
              </span>
            </div>
            <div className="row">
              <span className="col-md-3">{'Created By '}</span>
              <strong className="col-md-9">{job.getIn(['token', 'description'])}</strong>
            </div>
            <div className="row">
              <span className="col-md-3">{'End '}</span>
              <strong className="col-md-9">{renderDate(job.get('endTime'))}</strong>
            </div>
            <div className="row">
              <span className="col-md-3">Duration</span>
              <strong className="col-md-9">
                {jobStarted() ? <Duration startTime={job.get('startTime')} endTime={job.get('endTime')} /> : 'N/A'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  },

  _renderConfigVersion(job) {
    const configVersion = job.getIn(['result', 'configVersion']);

    if (configVersion) {
      return ` / Version #${configVersion}`;
    }

    const transformationConfigVersion = job.getIn(['params', 'transformation', 'config_version']);

    if (transformationConfigVersion) {
      return ` / Version #${transformationConfigVersion}`;
    }

    return null;
  },

  _renderAccordion(job) {
    return (
      <PanelGroup
        accordion={true}
        className="kbc-accordion kbc-panel-heading-with-table"
        activeKey={this.state.activeAccordion}
        onSelect={this._handleChangeActiveAccordion}
      >
        {this._isGoodDataWriter() && (
          <Panel
            header={this._renderAccordionHeader('Tasks', this.state.activeAccordion === 'gdresults')}
            eventKey="gdresults"
          >
            <GoodDataStatsContainer job={this.state.job} />
          </Panel>
        )}
        <Panel
          header={this._renderAccordionHeader('Parameters & Results', this.state.activeAccordion === 'params')}
          eventKey="params"
        >
          {this._renderParamsRow(job)}
        </Panel>
        <Panel header={this._renderAccordionHeader('Mapping', this.state.activeAccordion === 'stats')} eventKey="stats">
          <JobStatsContainer
            runId={job.get('runId')}
            autoRefresh={!job.get('endTime')}
            jobMetrics={job.get('metrics') ? job.get('metrics') : fromJS({})}
          />
        </Panel>
      </PanelGroup>
    );
  },

  _renderParamsRow(job) {
    let exceptionId, message;
    const status = job.get('status');
    const result = job.get('result');
    if (result) {
      exceptionId = job.getIn(['result', 'exceptionId']);
    }
    if (result) {
      message = job.getIn(['result', 'message']);
    }
    return (
      <div>
        <div className="col-md-6" style={{ wordWrap: 'break-word' }}>
          <h4>{'Parameters '}</h4>
          <Tree data={job.get('params')} />
        </div>
        <div className="col-md-6">
          <h4>{'Results '}</h4>
          {status === 'error' && (
            <div className="alert alert-danger">
              {exceptionId && <span>{`ExceptionId ${exceptionId}`}</span>}
              <p>{message}</p>
            </div>
          )}
          {status !== 'error' && result && <Tree data={result} />}
        </div>
      </div>
    );
  },

  _renderGeneralInfoRow(job) {
    const componentId = getComponentId(job);
    let component = ComponentsStore.getComponent(componentId);
    if (!component) {
      component = ComponentsStore.unknownComponent(componentId);
    }

    return (
      <div className="row">
        <div className="col-md-6">
          <span className="">
            <ComponentIcon component={component} size="32" /> <ComponentName component={component} showType={true} />
          </span>
        </div>
      </div>
    );
  },

  _renderLogRow(job) {
    return (
      <div>
        <div className="form-group">
          <div className="col-xs-12">
            <h2>Log</h2>
          </div>
        </div>
        <Events
          link={{
            to: 'jobDetail',
            params: {
              jobId: this.state.job.get('id')
            },
            query: {
              q: this.state.query
            }
          }}
          params={{
            runId: job.get('runId')
          }}
          autoReload={this._shouldAutoReload(job)}
        />
      </div>
    );
  },

  _isGoodDataWriter() {
    return getComponentId(this.state.job) === 'gooddata-writer';
  },

  _contactSupport() {
    return contactSupport({
      subject: `Help with job ${this.state.job.get('id')}`,
      type: 'direct'
    });
  },

  _renderAccordionHeader(text, isActive) {
    return (
      <span>
        <span className="table">
          <span className="tbody">
            <span className="tr">
              <span className="td">
                <h4>
                  {isActive ? (
                    <span className="fa fa-fw fa-angle-down" />
                  ) : (
                    <span className="fa fa-fw fa-angle-right" />
                  )}
                  {text}
                </h4>
              </span>
            </span>
          </span>
        </span>
      </span>
    );
  },

  _shouldAutoReload(job) {
    if (['canceled', 'cancelled'].includes(job.get('status'))) {
      return false;
    }

    if (job.get('isFinished') === false) {
      return true;
    }

    return moment().diff(job.get('endTime'), 'minutes') < 5;
  }
});
