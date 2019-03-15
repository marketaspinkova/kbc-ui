import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import StaticDuration from './DurationStatic';
import DynamicDuration from './DurationDynamic';

export default createReactClass({
  propTypes: {
    startTime: PropTypes.string,
    endTime: PropTypes.string
  },
  render() {
    if (!this.props.startTime) {
      return null;
    }

    if (!this.props.endTime) {
      return <DynamicDuration startTime={this.props.startTime} />;
    }

    return <StaticDuration startTime={this.props.startTime} endTime={this.props.endTime} />;
  }
});
