import PropTypes from 'prop-types';
import React from 'react';
import { List } from 'immutable';
import JobTasks from './JobTasks';
import Duration from '../../../../../react/common/Duration';
import JobStatusLabel from '../../../../../react/common/JobStatusLabel';
import JobRunId from '../../../../../react/common/JobRunId';
import date from '../../../../../utils/date';

export default React.createClass({
  propTypes: {
    job: PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <div className="table kbc-table-border-vertical kbc-detail-table">
          <div className="tr">
            <div className="td">
              <div className="row">
                <span className="col-md-4">Created At</span>
                <strong className="col-md-8">{date.format(this.props.job.get('createdTime'))}</strong>
              </div>
              <div className="row">
                <span className="col-md-4">Start</span>
                <strong className="col-md-8">{this._getValidStartTime()}</strong>
              </div>
              <div className="row">
                <span className="col-md-4">RunId</span>
                <strong className="col-md-8">
                  <JobRunId runId={this.props.job.get('runId')} />
                </strong>
              </div>
            </div>
            <div className="td">
              <div className="row">
                <span className="col-md-4">Status</span>
                <span className="col-md-8">
                  <JobStatusLabel status={this.props.job.get('status')} />
                </span>
              </div>
              <div className="row">
                <span className="col-md-4">End</span>
                <strong className="col-md-8">
                  {this.props.job.get('endTime') ? date.format(this.props.job.get('endTime')) : 'N/A'}
                </strong>
              </div>
              <div className="row">
                <span className="col-md-4">Created By</span>
                <strong className="col-md-8">{this.props.job.getIn(['initiatorToken', 'description'])}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="kbc-orchestration-tasks-heading">
          <h2>Tasks {this._renderTotalDurationInHeader()}</h2>
        </div>
        <JobTasks tasks={this.props.job.getIn(['results', 'tasks'], List())} />
      </div>
    );
  },

  _renderTotalDurationInHeader() {
    if (!this.props.job.get('startTime')) {
      return '';
    }

    return (
      <small className="pull-right">
        {'Total Duration '}
        <Duration startTime={this.props.job.get('startTime')} endTime={this.props.job.get('endTime')} />
      </small>
    );
  },

  _getValidStartTime() {
    if (this.props.job.get('startTime')) {
      return date.format(this.props.job.get('startTime'));
    } else {
      return 'N/A';
    }
  }
});
