import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import JobPartialRunLabel from '../../../../../react/common/JobPartialRunLabel';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import Duration from '../../../../../react/common/Duration';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import TransformationsStore from '../../../../transformations/stores/TransformationsStore';
import date from '../../../../../utils/date';
import { getJobComponentId, getUserConfiguredJob } from '../../../utils';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    job: React.PropTypes.object.isRequired,
    query: React.PropTypes.string.isRequired
  },

  render() {
    const component = this.getComponent();
    const userConfiguredJob = getUserConfiguredJob(this.props.job);

    return (
      <Link className="tr" to="jobDetail" params={this.linkParams()} query={this.linkQuery()}>
        <div className="td">
          <ComponentIcon component={component} size="32" />
          <ComponentName component={component} showType />
        </div>
        <div className="td">
          <JobPartialRunLabel job={userConfiguredJob} />
          {this.jobConfiguration(userConfiguredJob)}
        </div>
        <div className="td">{this.props.job.getIn(['token', 'description'])}</div>
        <div className="td">{date.format(this.props.job.get('createdTime'))}</div>
        <div className="td">
          <JobStatusLabel status={this.props.job.get('status')} />
        </div>
        <div className="td">
          <Duration
            startTime={this.props.job.get('startTime')}
            endTime={this.props.job.get('endTime')}
          />
        </div>
      </Link>
    );
  },

  jobConfiguration(job) {
    const componentId = getJobComponentId(job);

    if (componentId === 'provisioning') {
      if (job.hasIn(['params', 'transformation', 'config_id'])) {
        const componentConfigId = job.getIn(['params', 'transformation', 'config_id']);
        const componentName = InstalledComponentsStore.getConfig(
          'transformation',
          componentConfigId
        );

        return <span>{componentName.get('name', componentConfigId)}</span>;
      }

      return <span>Plain Sandbox</span>;
    }

    if (job.hasIn(['params', 'orchestration', 'name'])) {
      return <span>{job.getIn(['params', 'orchestration', 'name'])}</span>;
    }

    if (job.hasIn(['params', 'config'])) {
      const configId = job.getIn(['params', 'config']);
      const rowId = job.getIn(['params', 'transformations', 0], null);

      if (rowId) {
        return (
          <span>
            {TransformationsStore.getTransformationName(configId, rowId) || configId}
          </span>
        );
      }

      return (
        <span>
          {InstalledComponentsStore.getConfig(componentId, configId).get('name', configId)}
        </span>
      );
    }

    return <em>N/A</em>;
  },

  linkParams() {
    return {
      jobId: this.props.job.get('id')
    };
  },

  linkQuery() {
    return {
      q: this.props.query
    };
  },

  getComponent() {
    const componentId = getJobComponentId(this.props.job);
    const component = ComponentsStore.getComponent(componentId);
    return component ? component : ComponentsStore.unknownComponent(componentId);
  }
});
