import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Duration from './Duration';

const DurationWithIcon = ({ startTime, endTime }) => (
  <span>
    <i className="fa fa-clock-o" />
    {' '}
    <Duration startTime={startTime} endTime={endTime} />
  </span>
);
DurationWithIcon.propTypes = {
  startTime: PropTypes.string,
  endTime: PropTypes.string
};
export default DurationWithIcon;
