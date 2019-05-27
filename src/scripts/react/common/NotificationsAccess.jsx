import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  propTypes: {
    notifications: PropTypes.object.isRequired
  },

  render() {
    return (
      <a href={this.props.notifications.get('url')} className="kbc-notification-access">
        <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M20.6435 16.7947C20.706 16.8596 20.7659 16.9219 20.8228 16.9823C21.1071 17.2842 21.2332 17.6461 21.2308 18C21.2261 18.7687 20.6157 19.5 19.7096 19.5H1.52126C0.615156 19.5 0.00524568 18.7687 3.2765e-05 18C-0.00233674 17.6461 0.123721 17.2847 0.408062 16.9823C0.46493 16.9219 0.524876 16.8596 0.587297 16.7947C1.52985 15.8145 3.03679 14.2475 3.03679 9.75C3.03679 6.10781 5.6186 3.19219 9.09988 2.47688V1.5C9.09988 0.671719 9.77851 0 10.6154 0C11.4523 0 12.131 0.671719 12.131 1.5V2.47688C15.6122 3.19219 18.194 6.10781 18.194 9.75C18.194 14.2475 19.701 15.8145 20.6435 16.7947ZM13.6472 21C13.6472 22.657 12.2895 24 10.6157 24C8.94184 24 7.58411 22.657 7.58411 21H13.6472Z" fill="#7F8198"/>
        </svg>
        {this.badge()}
      </a>
    );
  },

  badge() {
    if (this.props.notifications.get('unreadCount') === 0) {
      return null;
    }

    return (
      <span className="kbc-notification-icon-badge">
        <span className="kbc-notification-icon-badge-inner">
          {this.props.notifications.get('unreadCount')}
        </span>
      </span>
    );
  }
});