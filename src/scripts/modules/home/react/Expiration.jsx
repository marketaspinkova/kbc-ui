import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { AlertBlock } from '@keboola/indigo-ui';
import contactSupport from '../../../utils/contactSupport';

export default createReactClass({
  propTypes: {
    expires: PropTypes.string
  },

  render() {
    if (!this.props.expires || parseInt(this.days(), 10) > 30) {
      return null;
    }

    return (
      <AlertBlock type="warning" title={'This project will expire in '  + this.days()}>
        <p>Please <a onClick={contactSupport}>contact support</a> for project plan upgrade.</p>
      </AlertBlock>
    );
  },

  days() {
    const days = Math.max(0, Math.round(moment(this.props.expires).diff(moment(), 'days', true)));

    switch(days) {
      case 0:
        return 'less than a day';
      case 1:
        return '1 day';
      default:
        return `${days} days`;
    }
  }
});
