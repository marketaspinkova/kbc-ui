import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import moment from 'moment';
import StatusLabel from '../../../../../react/common/JobStatusLabel';
import { fromJS } from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { timeInWords } from '../../../../../utils/duration';
import date from '../../../../../utils/date';
import { Tree, ExternalLink } from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    tasks: PropTypes.array.isRequired
  },

  render() {
    return (
      <div className="table table-striped table-hover">
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th">
              <strong>Id</strong>
            </span>
            <span className="th">
              <strong>Name</strong>
            </span>
            <span className="th">
              <strong>Started</strong>
            </span>
            <span className="th">
              <strong>Duration</strong>
            </span>
            <span className="th">
              <strong>Status</strong>
            </span>
            <span className="th">
              <strong>Details</strong>
            </span>
            <span className="th">
              <strong>Params</strong>
            </span>
          </div>
        </div>
        <div className="tbody">{this.renderTasks()}</div>
      </div>
    );
  },

  renderTasks() {
    return _.map(this.props.tasks, (task, taskId) => {
      const params = fromJS(task.params);
      let started = 'N/A';
      let duration = 'N/A';
      let status = 'N/A';
      let details = 'N/A';

      if (task.event) {
        duration = task.event.performance.duration;
        const finished = moment(task.event.created);
        started = finished.subtract(duration, 'seconds'); // TODO
        status = <StatusLabel status={task.event && task.event.type} />;

        if (task.event.params && task.event.params.details) {
          const eventParams = fromJS(task.event.params.details);

          if (typeof eventParams === 'string') {
            details = eventParams;
          } else {
            details = <Tree data={eventParams} />;
          }
        }

        started = date.format(started.toISOString());
      }

      return (
        <div className="tr" key={taskId}>
          {this.renderCell(taskId.toString())}
          {this.renderCell(task.name)}
          {this.renderCell(started)}
          {this.renderCell(timeInWords(duration))}
          {this.renderCell(status)}
          {this.renderCell(this.renderLinkIf(details))}
          {this.renderCell(<Tree data={params} />)}
        </div>
      );
    });
  },

  renderLinkIf(value) {
    if (!value) {
      return null;
    }
    if (!_.isString(value)) {
      return value;
    }
    if (value.trim().startsWith('http')) {
      return (
        <ExternalLink href={value}>
          Raw log
        </ExternalLink>
      );
    }
    return value;
  },

  renderCell(value) {
    return <div className="td">{value || 'N/A'}</div>;
  }
});
