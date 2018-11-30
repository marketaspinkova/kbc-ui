import React from 'react';
import moment from 'moment';
import date from '../../utils/date';

export default React.createClass({
  propTypes: {
    createdTime: React.PropTypes.string.isRequired,
    relative: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      relative: true
    };
  },

  render() {
    if (this.props.relative) {
      return (
        <span title={date.format(this.props.createdTime)}>
          <i className="fa fa-fw fa-calendar" /> {moment(this.props.createdTime).fromNow()}
        </span>
      );
    }

    return (
      <span title={moment(this.props.createdTime).fromNow()}>
        <i className="fa fa-fw fa-calendar" /> {date.format(this.props.createdTime)}
      </span>
    );
  }
});
