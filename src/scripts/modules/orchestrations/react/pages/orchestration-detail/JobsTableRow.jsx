import PropTypes from 'prop-types';
import React from 'react';
import Router from 'react-router';
import Duration from '../../../../../react/common/Duration';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import date from '../../../../../utils/date';
import ImmutableRendererMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [Router.Navigation, Router.State, ImmutableRendererMixin],

  propTypes: {
    job: PropTypes.object.isRequired,
    onJobCancel: PropTypes.func
  },

  jobDetail(event) {
    event.stopPropagation();
    // method provided by Router.Navigation mixin
    this.transitionTo('orchestrationJob', {
      orchestrationId: this.getParams().orchestrationId, // current orchestration id
      jobId: this.props.job.get('id')
    });
  },

  cancelJob(event) {
    event.stopPropagation();
    return this.props.onJobCancel(this.props.job);
  },

  render() {
    return (
      <tr onClick={this.jobDetail}>
        <td>{this.props.job.getIn(['initiatorToken', 'description'])}</td>
        <td>{date.format(this.props.job.get('createdTime'))}</td>
        <td>
          <JobStatusLabel status={this.props.job.get('status')} />
        </td>
        <td>
          <Duration startTime={this.props.job.get('startTime')} endTime={this.props.job.get('endTime')} />
        </td>
      </tr>
    );
  }
});
