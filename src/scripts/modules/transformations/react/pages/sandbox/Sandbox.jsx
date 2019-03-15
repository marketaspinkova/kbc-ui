import React from 'react';
import createReactClass from 'create-react-class';
import RedshiftSandbox from '../../components/RedshiftSandbox';
import SnowflakeSandbox from '../../components/SnowflakeSandbox';
import RStudioSandbox from '../../components/RStudioSandbox';
import JupyterSandbox from '../../components/JupyterSandbox';
import ApplicationStore from '../../../../../stores/ApplicationStore';

export default createReactClass({
  displayName: 'Sandbox',
  render: function() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {ApplicationStore.getSapiToken().getIn(['owner', 'hasRedshift'], false) && <RedshiftSandbox />}
          {ApplicationStore.getSapiToken().getIn(['owner', 'hasSnowflake'], false) && <SnowflakeSandbox />}
          <RStudioSandbox />
          <JupyterSandbox />
        </div>
      </div>
    );
  }
});
