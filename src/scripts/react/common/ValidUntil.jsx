import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';

export default createReactClass({
  propTypes: {
    validUntil: PropTypes.number
  },

  render() {
    if (this.props.validUntil < moment.now()) {
      return <span>any time now</span>;
    }

    return <span>{this.props.validUntil ? moment(this.props.validUntil).fromNow() : 'N/A'}</span>;
  }
});
