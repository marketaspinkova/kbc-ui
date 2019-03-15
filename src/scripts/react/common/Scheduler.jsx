import PropTypes from 'prop-types';
import React from 'react';
import later from 'later';
import _ from 'underscore';
import Select from 'react-select';
// https://github.com/moment/moment-timezone/issues/697
import moment from 'moment-timezone/builds/moment-timezone-with-data-2012-2022';
import date from '../../utils/date';

const PERIOD_OPTIONS = [
  {
    value: later.hour.name,
    label: 'Hour'
  },
  {
    value: later.day.name,
    label: 'Day'
  },
  {
    value: later.dayOfWeek.name,
    label: 'Week'
  },
  {
    value: later.month.name,
    label: 'Month'
  },
  {
    value: later.year.name,
    label: 'Year'
  }
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const lpad = (value, padding) => {
  let zeroes = '0';
  for (let i = 1, end = padding, asc = end >= 1; asc ? i <= end : i >= end; asc ? i++ : i--) {
    zeroes += '0';
  }

  return (zeroes + value).slice(padding * -1);
};

export default React.createClass({
  propTypes: {
    M: PropTypes.array.isRequired,
    D: PropTypes.array.isRequired,
    d: PropTypes.array.isRequired,
    h: PropTypes.array.isRequired,
    m: PropTypes.array.isRequired,
    period: PropTypes.string.isRequired,
    next: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onPeriodChange: PropTypes.func.isRequired
  },

  render() {
    return (
      <div className="form">
        <div className="form-group">
          <label>{'Every '}</label>
          <div>{this._periodSelect()}</div>
        </div>
        {this._renderCurrentPeriod()}
        <div>
          <h3>
            {'Next Schedules '}
            <small>(In your local time)</small>
          </h3>
          <ul>
            {this.props.next.map(time => (
              <li key={time}>{date.format(time)}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  },

  _renderCurrentPeriod() {
    const currentPeriod = this.props.period;

    switch (currentPeriod) {
      case later.year.name:
        return (
          <div key="year">
            <div className="form-group">
              <label>{' on the '}</label>
              {this._daySelect()}
            </div>
            <div className="form-group">
              <label>{' of '}</label>
              {this._monthSelect()}
            </div>
            {this._hoursAndMinutes()}
          </div>
        );

      case later.month.name:
        return (
          <div key="month">
            <div className="form-group">
              <label>{' on the '}</label>
              {this._daySelect()}
            </div>
            {this._hoursAndMinutes()}
          </div>
        );

      case later.dayOfWeek.name:
        return (
          <div key="dayOfWeek">
            <div className="form-group">
              <label>{' on '}</label>
              {this._dayOfWeekSelect()}
            </div>
            {this._hoursAndMinutes()}
          </div>
        );

      case later.day.name:
        return <div key="day">{this._hoursAndMinutes()}</div>;

      default:
        return (
          <div className="form-group">
            <label>at</label>
            {this._minuteSelect()}
          </div>
        );
    }
  },

  _hoursAndMinutes() {
    return (
      <div>
        <div className="form-group">
          <label>{' at '}</label>
          <span>{this._hourSelect()}</span>
          <p className="help-block">
            {'Hours '}
            <strong>UTC</strong>
            <span className="text-muted">
              {' (Current time is '}
              {moment()
                .tz('UTC')
                .format('HH:mm')}
              {' UTC)'}
            </span>
          </p>
        </div>
        <div className="form-group">
          {this._minuteSelect()}
          <p className="help-block">Minutes</p>
        </div>
      </div>
    );
  },

  _periodSelect() {
    return (
      <Select
        options={PERIOD_OPTIONS}
        value={this.props.period}
        onChange={this.props.onPeriodChange}
        clearable={false}
      />
    );
  },

  _daySelect() {
    return (
      <Select
        options={_.range(0, 31).map(value => ({
          value: `${value + 1}`,
          label: `${value + 1}.`
        }))}
        value={this._valueForMultiSelect(this.props.D)}
        multi={true}
        placeholder="-- Every Day --"
        onChange={this._handleChange.bind(this, 'D')}
      />
    );
  },

  _monthSelect() {
    const options = MONTHS.map((value, key) => ({
      value: `${key + 1}`,
      label: value
    }));
    return (
      <Select
        options={options}
        value={this._valueForMultiSelect(this.props.M)}
        multi={true}
        placeholder="-- Every Month --"
        onChange={this._handleChange.bind(this, 'M')}
      />
    );
  },

  _dayOfWeekSelect() {
    const options = DAYS.map((value, key) => ({
      value: `${key + 1}`,
      label: `${value}`
    }));
    return (
      <Select
        options={options}
        value={this._valueForMultiSelect(this.props.d)}
        multi={true}
        placeholder="-- Every Week Day --"
        onChange={this._handleChange.bind(this, 'd')}
      />
    );
  },

  _hourSelect() {
    return (
      <Select
        options={_.range(0, 24).map(value => ({
          value: `${value}`,
          label: lpad(value, 2)
        }))}
        value={this._valueForMultiSelect(this.props.h)}
        multi={true}
        placeholder="-- Every Hour --"
        onChange={this._handleChange.bind(this, 'h')}
      />
    );
  },

  _minuteSelect() {
    return (
      <Select
        options={_.range(0, 60).map(value => ({
          value: `${value}`,
          label: lpad(value, 2)
        }))}
        value={this._valueForMultiSelect(this.props.m)}
        placeholder="-- Every Minute --"
        multi={true}
        onChange={this._handleChange.bind(this, 'm')}
      />
    );
  },

  _valueForMultiSelect(items) {
    if (items.length) {
      return items.join(',');
    } else {
      return null;
    }
  },

  _handleChange(propName, newValue) {
    return this.props.onChange(propName, newValue);
  }
});
