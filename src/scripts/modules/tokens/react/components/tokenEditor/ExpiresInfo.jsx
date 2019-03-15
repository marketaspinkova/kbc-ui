import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';

export default createReactClass({

  propTypes: {
    withIcon: PropTypes.bool,
    token: PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      withIcon: false
    };
  },

  render() {
    const expires = this.props.token.get('expires');
    if (!expires) {
      return <span>Never</span>;
    }

    return (
      <span title={this.formatDate(expires)}>
        {this.props.withIcon && <i className="fa fa-fw fa-calendar" />}
        {' '}
        {moment(expires).fromNow()}
      </span>
    );
  },

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

});
