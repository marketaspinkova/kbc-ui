import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import date from '../../utils/date';

export default createReactClass({
  propTypes: {
    createdTime: PropTypes.string.isRequired,
    relative: PropTypes.bool
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
          {moment(this.props.createdTime).fromNow()}
        </span>
      );
    }

    return (
      <span title={moment(this.props.createdTime).fromNow()}>
        {date.format(this.props.createdTime)}
      </span>
    );
  }
});
