import PropTypes from 'prop-types';
import React from 'react';
import ValidUntil from './ValidUntil';
import date from '../../utils/date';

export default React.createClass({
  propTypes: {
    validUntil: PropTypes.number
  },

  render() {
    return (
      <span title={date.format(this.props.validUntil)}>
        <i className="fa fa-calendar" /> <ValidUntil validUntil={this.props.validUntil} />
      </span>
    );
  }
});
