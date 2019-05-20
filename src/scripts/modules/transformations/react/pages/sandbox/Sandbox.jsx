import React from 'react';
import createReactClass from 'create-react-class';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import RedshiftSandbox from '../../components/RedshiftSandbox';
import SnowflakeSandbox from '../../components/SnowflakeSandbox';
import RStudioSandbox from '../../components/RStudioSandbox';
import JupyterSandbox from '../../components/JupyterSandbox';

export default createReactClass({
  getInitialState() {
    const token = ApplicationStore.getSapiToken();

    return {
      hasRedshift: token.getIn(['owner', 'hasRedshift'], false),
      hasSnowflake: token.getIn(['owner', 'hasSnowflake'], false)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this.state.hasRedshift && <RedshiftSandbox />}
          {this.state.hasSnowflake && <SnowflakeSandbox />}
          <RStudioSandbox />
          <JupyterSandbox />
        </div>
      </div>
    );
  }
});
