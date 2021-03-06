import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { timeInWords, durationFrom } from '../../utils/duration';

export default createReactClass({
  propTypes: {
    startTime: PropTypes.string,
    endTime: PropTypes.string
  },
  render() {
    return (
      <span>
        {timeInWords(durationFrom(this.props.startTime, this.props.endTime), true)}
      </span>
    );
  }
});
