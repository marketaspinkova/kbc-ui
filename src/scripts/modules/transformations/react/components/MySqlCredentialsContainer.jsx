import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import MySqlSandboxCredentialsStore from '../../../provisioning/stores/MySqlSandboxCredentialsStore';
import MySqlCredentials from '../../../provisioning/react/components/MySqlCredentials';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';

export default React.createClass({
  propTypes: {
    isAutoLoad: React.PropTypes.bool.isRequired
  },

  mixins: [createStoreMixin(MySqlSandboxCredentialsStore)],

  componentDidMount() {
    if (!this.state.credentials.get('id') && this.props.isAutoLoad) {
      return CredentialsActionCreators.createMySqlSandboxCredentials();
    }
  },

  getStateFromStores() {
    return {
      credentials: MySqlSandboxCredentialsStore.getCredentials(),
      validUntil: MySqlSandboxCredentialsStore.getValidUntil(),
      pendingActions: MySqlSandboxCredentialsStore.getPendingActions(),
      isLoading: MySqlSandboxCredentialsStore.getIsLoading(),
      isLoaded: MySqlSandboxCredentialsStore.getIsLoaded()
    };
  },

  render() {
    return (
      <MySqlCredentials
        credentials={this.state.credentials}
        validUntil={this.state.validUntil}
        isCreating={this.state.pendingActions.get('create')}
        hideClipboard={false}
      />
    );
  }
});
