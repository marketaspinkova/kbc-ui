import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { timeInWords, durationFrom } from '../../utils/duration';

export default createReactClass({
  propTypes: {
    startTime: PropTypes.string
  },
  getInitialState() {
    return {
      endTime: new Date().toString()
    };
  },
  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  tick() {
    this.setState({
      endTime: new Date().toString()
    });
  },
  render() {
    return (
      <span>
        {timeInWords(durationFrom(this.props.startTime, this.state.endTime))}
      </span>
    );
  }
});
