import PropTypes from 'prop-types';
import React from 'react';
import later from 'later';
import _ from 'underscore';
import Scheduler from './Scheduler';

export default React.createClass({
  propTypes: {
    crontabRecord: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  },

  getInitialState() {
    const schedules = later.parse.cron(this.props.crontabRecord);
    return { period: this._getPeriodForSchedule(schedules.schedules[0]) };
  },

  render() {
    const schedule = this._getSchedule();

    return (
      <div>
        <Scheduler
          period={this.state.period}
          M={schedule.M || []}
          D={schedule.D || []}
          d={schedule.d || []}
          h={schedule.h || []}
          m={schedule.m || []}
          next={this._getNext()}
          onChange={this._handleChange}
          onPeriodChange={this._handlePeriodChange}
        />
      </div>
    );
  },

  _handleChange(propName, newValue) {
    const schedule = this._getSchedule();
    if (newValue.length > 0) {
      schedule[propName] = _.unique(newValue.map(option => option.value));
    } else {
      delete schedule[propName];
    }
    return this.props.onChange(this._scheduleToCron(schedule));
  },

  _handlePeriodChange(selected) {
    const newValue = selected.value;
    // change current schedule
    const schedule = this._getSchedule();
    let toDelete = [];

    switch (newValue) {
      case later.hour.name:
        toDelete = ['M', 'D', 'h', 'd'];
        break;

      case later.day.name:
        toDelete = ['M', 'D', 'd'];
        break;

      case later.dayOfWeek.name:
        toDelete = ['M', 'D'];
        break;

      case later.month.name:
        toDelete = ['M', 'd'];
        break;

      default:
        break;
    }

    toDelete.forEach(key => delete schedule[key]);

    this.props.onChange(this._scheduleToCron(schedule));

    return this.setState({
      period: newValue
    });
  },

  _getPeriodForSchedule(schedules) {
    if (schedules.M) {
      return later.year.name;
    }

    if (schedules.D) {
      return later.month.name;
    }

    if (schedules.d) {
      return later.dayOfWeek.name;
    }

    if (schedules.h) {
      return later.day.name;
    }

    return later.hour.name;
  },

  _getSchedule() {
    later.date.UTC();
    return later.parse.cron(this.props.crontabRecord).schedules[0];
  },

  _getNext() {
    return later.schedule(later.parse.cron(this.props.crontabRecord)).next(5);
  },

  _scheduleToCron(schedule) {
    const flatten = part => {
      if (!part) {
        return '*';
      } else {
        return _.sortBy(part, item => parseInt(item, 10)).join(',');
      }
    };

    const flattenDayOfWeek = part => {
      if (!part) {
        return '*';
      } else {
        return part.map(value => value - 1).join(',');
      }
    };

    const parts = [];
    parts.push(flatten(schedule.m));
    parts.push(flatten(schedule.h));
    parts.push(flatten(schedule.D));
    parts.push(flatten(schedule.M));
    parts.push(flattenDayOfWeek(schedule.d));

    return parts.join(' ');
  }
});
