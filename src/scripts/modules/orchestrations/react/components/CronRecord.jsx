import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import prettyCron from 'prettycron';

export default createReactClass({
  propTypes: {
    crontabRecord: PropTypes.string
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.crontabRecord !== this.props.crontabRecord;
  },

  cronUTCtext(crontab) {
    const cArray = crontab.split(' ');
    if (cArray && cArray[1] !== '*') {
      return ' (UTC) ';
    }
    return '';
  },

  render() {
    return (
      <span>
        {this.props.crontabRecord ? (
          <span>
            {prettyCron.toString(this.props.crontabRecord)}
            <span>{this.cronUTCtext(this.props.crontabRecord)}</span>
          </span>
        ) : (
          'No Schedule'
        )}
      </span>
    );
  }
});
