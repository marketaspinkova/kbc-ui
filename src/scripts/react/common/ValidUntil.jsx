import React from 'react';
import moment from 'moment';
import {NotAvailable} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    validUntil: React.PropTypes.number
  },

  render() {
    if (this.props.validUntil < moment.now()) {
      return <span>any time now</span>;
    }

    return this.props.validUntil ? <span>{moment(this.props.validUntil).fromNow()}</span> : <NotAvailable/>;
  }
});
