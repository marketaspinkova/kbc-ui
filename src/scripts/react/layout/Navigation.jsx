import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import classnames from 'classnames';
import NotificationsAccess from '../common/NotificationsAccess';

export default createReactClass({
  propTypes: {
    notifications: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="navbar">
        <ul className="nav navbar-nav">
          {this.getPages().map((page) => (
            <li key={page.id}>
              <Link to={page.id} className="navbar-link">
                <span className={classnames('kbc-icon', page.icon)} />
                <span>{page.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar-setting">{this.renderNotifications()}</div>
      </div>
    );
  },

  renderNotifications() {
    if (!this.props.notifications.get('isEnabled')) {
      return null;
    }

    return <NotificationsAccess notifications={this.props.notifications} />;
  },

  getPages() {
    return [
      {
        id: 'home',
        title: 'Dashboard',
        icon: 'kbc-icon-overview'
      },
      {
        id: 'applications',
        title: 'App Store',
        icon: 'kbc-icon-applications'
      },
      {
        id: 'storage-explorer',
        title: 'Storage',
        icon: 'kbc-icon-storage'
      },
      {
        id: 'orchestrations',
        title: 'Orchestrations',
        icon: 'kbc-icon-orchestrations'
      },
      {
        id: 'transformations',
        title: 'Transformations',
        icon: 'kbc-icon-transformations'
      },
      {
        id: 'jobs',
        title: 'Jobs',
        icon: 'kbc-icon-jobs'
      }
    ];
  }
});
