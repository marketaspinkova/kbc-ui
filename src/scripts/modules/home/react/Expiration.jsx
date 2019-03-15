import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import contactSupport from '../../../utils/contactSupport';
import IntlMessageFormat from 'intl-messageformat';
import {AlertBlock} from '@keboola/indigo-ui';

const MESSAGES = {
  DAYS: '{days, plural, ' +
  '=0 {less than a day}' +
  '=1 {# day}' +
  'other {# days}}'
};

export default React.createClass({
  propTypes: {
    expires: PropTypes.string
  },

  render() {
    const {expires} = this.props;

    if (!expires || parseInt(this.days(), 10) > 30) {
      return null;
    }

    return (
      <AlertBlock type="warning" title={'This project will expire in '  + this.days()}>
        <p>Please <a onClick={contactSupport}>contact support</a> for project plan upgrade.</p>
      </AlertBlock>
    );
  },

  days() {
    // Math.round is used for compatibility with ranges computed by backend (settings page)
    return new IntlMessageFormat(MESSAGES.DAYS).format({
      days: Math.max(0, Math.round(moment(this.props.expires).diff(moment(), 'days', true)))
    });
  }
});
