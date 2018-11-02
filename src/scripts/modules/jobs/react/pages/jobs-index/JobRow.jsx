import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Link} from 'react-router';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import Duration from '../../../../../react/common/Duration';

import ComponentsStore from '../../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../../components/stores/InstalledComponentsStore';
import date from '../../../../../utils/date';
import getComponentId from '../../../getJobComponentId';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    job: React.PropTypes.object.isRequired,
    query: React.PropTypes.string.isRequired
  },

  render() {
    const component = this.getComponent();
    return (
      <Link className="tr" to="jobDetail" params={this.linkParams()} query={this.linkQuery()}>
        <div className="td">
          <ComponentIcon component={component} size="32"/> <ComponentName component={component} showType />
        </div>
        <div className="td">
          { this.jobConfiguration() }
        </div>
        <div className="td">
          {this.props.job.getIn(['token', 'description'])}
        </div>
        <div className="td">
          {date.format(this.props.job.get('createdTime'))}
        </div>
        <div className="td">
          <JobStatusLabel status={this.props.job.get('status')}/>
        </div>
        <div className="td">
          <Duration startTime={this.props.job.get('startTime')} endTime={this.props.job.get('endTime')}/>
        </div>
      </Link>
    );
  },

  jobConfiguration() {
    const componentId = getComponentId(this.props.job);

    if (componentId === 'orchestrator') {
      return (
        <span>{this.props.job.getIn(['params', 'orchestration', 'name'])}</span>
      );
    }

    if (componentId === 'provisioning' && this.props.job.hasIn(['params', 'transformation', 'config_id'])) {
      return (
        <span>{this.props.job.getIn(['params', 'transformation', 'config_id'])}</span>
      );
    }

    const configId = this.props.job.getIn(['params', 'config']);
    if (!configId) {
      return (
        <span><em>N/A</em></span>
      );
    }

    const config = InstalledComponentsStore.getConfig(componentId, configId);
    if (!config || !config.get('name')) {
      return (
        <span>{configId}</span>
      );
    }

    return (
      <span>{config.get('name')}</span>
    );
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
    const componentId = getComponentId(this.props.job);
    const component = ComponentsStore.getComponent(componentId);
    return component ? component : ComponentsStore.unknownComponent(componentId);
  }

});
