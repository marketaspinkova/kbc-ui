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
        <span className="kbc-notification-icon fa fa-bell">
          {this.badge()}
        </span>
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