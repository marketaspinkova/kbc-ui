import React from 'react';
import timeInWords, { durationFrom } from '../../utils/duration';

export default React.createClass({
  propTypes: {
    startTime: React.PropTypes.string
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
