import React from 'react';
import MySqlSandbox from '../../components/MySqlSandbox';
import RedshiftSandbox from '../../components/RedshiftSandbox';
import SnowflakeSandbox from '../../components/SnowflakeSandbox';
import RStudioSandbox from '../../components/RStudioSandbox';
import JupyterSandbox from '../../components/JupyterSandbox';
import ApplicationStore from '../../../../../stores/ApplicationStore';

export default React.createClass({
  displayName: 'Sandbox',
  render: function() {
    return (
      <div className="container-fluid">
        <div className="col-md-12 kbc-main-content">
          {ApplicationStore.hasCurrentProjectFeature('transformation-mysql') && <MySqlSandbox />}
          {ApplicationStore.getSapiToken().getIn(['owner', 'hasRedshift'], false) && <RedshiftSandbox />}
          {ApplicationStore.getSapiToken().getIn(['owner', 'hasSnowflake'], false) && <SnowflakeSandbox />}
          <RStudioSandbox />
          <JupyterSandbox />
        </div>
      </div>
    );
  }
});
