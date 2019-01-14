import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';

export default React.createClass({
  mixins: [createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      routeName: RoutesStore.getCurrentRouteConfig().get('name')
    };
  },

  render() {
    return (
      <ul className="nav nav-tabs">
        <li className={this.activeClass('buckets')}>
          <Link to="storage-explorer">Buckets</Link>
        </li>
        <li className={this.activeClass('files')}>
          <Link to="storage-explorer-files">Files</Link>
        </li>
        <li className={this.activeClass('jobs')}>
          <Link to="storage-explorer-jobs">Jobs</Link>
        </li>
      </ul>
    );
  },

  activeClass(name) {
    return classnames({ active: this.activeLink() === name });
  },

  activeLink() {
    if (this.state.routeName === 'storage-explorer-jobs') {
      return 'jobs';
    }

    if (this.state.routeName === 'storage-explorer-files') {
      return 'files';
    }

    return 'buckets';
  }
});
