import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Link, State } from 'react-router';

export default createReactClass({
  mixins: [State],

  render() {
    const isFilesActive = this.isActive('storage-explorer-files');
    const isJobsActive = this.isActive('storage-explorer-jobs');

    return (
      <ul className="nav nav-tabs">
        <li className={classnames({ active: !isFilesActive && !isJobsActive })}>
          <Link to="storage-explorer">Buckets</Link>
        </li>
        <li className={classnames({ active: isFilesActive })}>
          <Link to="storage-explorer-files">Files</Link>
        </li>
        <li className={classnames({ active: isJobsActive })}>
          <Link to="storage-explorer-jobs">Jobs</Link>
        </li>
      </ul>
    );
  }
});
