import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Link, State } from 'react-router';
import {FEATURE_UI_DEVEL_PREVIEW} from '../../../../constants/KbcConstants';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default createReactClass({
  mixins: [State],

  render() {
    const isFilesActive = this.isActive('storage-explorer-files');
    const isJobsActive = this.isActive('storage-explorer-jobs');
    const isDocumentationActive = this.isActive('storage-explorer-documentation');

    return (
      <ul className="nav nav-tabs">
        <li className={classnames({ active: !isFilesActive && !isJobsActive && !isDocumentationActive })}>
          <Link to="storage-explorer">Buckets</Link>
        </li>
        <li className={classnames({ active: isFilesActive })}>
          <Link to="storage-explorer-files">Files</Link>
        </li>
        <li className={classnames({ active: isJobsActive })}>
          <Link to="storage-explorer-jobs">Jobs</Link>
        </li>
        {ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW) &&
         <li className={classnames({ active: isDocumentationActive})}>
           <Link to="storage-explorer-documentation">Documentation</Link>
         </li>}
      </ul>
    );
  }
});
