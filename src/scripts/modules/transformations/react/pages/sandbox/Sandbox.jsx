import React from 'react';
import createReactClass from 'create-react-class';
import Promise from 'bluebird';

import RedshiftSandbox from '../../components/RedshiftSandbox';
import SnowflakeSandbox from '../../components/SnowflakeSandbox';
import RStudioSandbox from '../../components/RStudioSandbox';
import JupyterSandbox from '../../components/JupyterSandbox';
import Loader from '../../../../../react/common/CustomLoader';
import ProvisioningActionCreators from '../../../../provisioning/ActionCreators';
import StorageActionCreators from '../../../../components/StorageActionCreators';
import ApplicationStore from '../../../../../stores/ApplicationStore';

export default createReactClass({
  getInitialState() {
    const token = ApplicationStore.getSapiToken();

    return {
      hasRedshift: token.getIn(['owner', 'hasRedshift'], false),
      hasSnowflake: token.getIn(['owner', 'hasSnowflake'], false),
      loading: false
    };
  },

  componentDidMount() {
    this.loadData();
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this.state.loading ? (
            <div className="kbc-inner-padding">
              <Loader show={this.state.loading} text="Loading data..." loaderSize="2x" />
            </div>
          ) : (
            <div>
              {this.state.hasRedshift && <RedshiftSandbox />}
              {this.state.hasSnowflake && <SnowflakeSandbox />}
              <RStudioSandbox />
              <JupyterSandbox />
            </div>
          )}
        </div>
      </div>
    );
  },

  loadData() {
    const promises = [
      StorageActionCreators.loadBuckets(),
      StorageActionCreators.loadTables(),
      ProvisioningActionCreators.loadRStudioSandboxCredentials(),
      ProvisioningActionCreators.loadJupyterSandboxCredentials(),
      this.state.hasRedshift ? ProvisioningActionCreators.loadRedshiftSandboxCredentials() : false,
      this.state.hasSnowflake ? ProvisioningActionCreators.loadSnowflakeSandboxCredentials() : false
    ].filter(Boolean);

    this.setState({ loading: true });
    this.cancellablePromise = Promise.all(promises).finally(() => {
      this.setState({ loading: false });
    });
  }
});
