import React from 'react';
import createReactClass from 'create-react-class';
import {State, Link} from 'react-router';

import ApplicationStore from '../../stores/ApplicationStore';
import RoutesStore from '../../stores/RoutesStore';

const SidebarNavigation = createReactClass({
  mixins: [State],

  render() {
    return (
      <ul className="kbc-nav-sidebar nav nav-sidebar">
        {this.getPages().map(page => {
          return (
            <li className={this.isActive(page.id) ? 'active' : ''} key={page.id}>
              {RoutesStore.hasRoute(page.id) ? (
                <Link to={page.id}>
                  <span className={page.icon} />
                  <span>{page.title}</span>
                </Link>
              ) : (
                <a href={ApplicationStore.getProjectPageUrl(page.id)}>
                  <span className={page.icon} />
                  <span>{page.title}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    );
  },

  getPages() {
    return [
      {
        id: 'home',
        title: 'Overview',
        icon: 'kbc-icon-overview'
      },
      {
        id: 'extractors',
        title: 'Extractors',
        icon: 'kbc-icon-extractors'
      },
      {
        id: 'transformations',
        title: 'Transformations',
        icon: 'kbc-icon-transformations'
      },
      {
        id: 'writers',
        title: 'Writers',
        icon: 'kbc-icon-writers'
      },
      {
        id: 'orchestrations',
        title: 'Orchestrations',
        icon: 'kbc-icon-orchestrations'
      },
      {
        id: 'storage-explorer',
        title: 'Storage',
        icon: 'kbc-icon-storage'
      },
      {
        id: 'jobs',
        title: 'Jobs',
        icon: 'kbc-icon-jobs'
      },
      {
        id: 'applications',
        title: 'Applications',
        icon: 'kbc-icon-applications'
      }
    ];
  }
});

export default SidebarNavigation;
