import PropTypes from 'prop-types';
import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import SnowflakeSandboxCredentialsStore from '../../../provisioning/stores/SnowflakeSandboxCredentialsStore';
import SnowflakeCredentials from '../../../provisioning/react/components/SnowflakeCredentials';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';

export default React.createClass({
  propTypes: {
    isAutoLoad: PropTypes.bool.isRequired
  },

  mixins: [createStoreMixin(SnowflakeSandboxCredentialsStore)],

  componentDidMount() {
    if (!this.state.credentials.get('id') && this.props.isAutoLoad) {
      CredentialsActionCreators.createSnowflakeSandboxCredentials();
    }
  },

  getStateFromStores() {
    return {
      credentials: SnowflakeSandboxCredentialsStore.getCredentials(),
      pendingActions: SnowflakeSandboxCredentialsStore.getPendingActions(),
      isLoading: SnowflakeSandboxCredentialsStore.getIsLoading(),
      isLoaded: SnowflakeSandboxCredentialsStore.getIsLoaded()
    };
  },

  render() {
    return (
      <SnowflakeCredentials credentials={this.state.credentials} isCreating={this.state.pendingActions.get('create')} />
    );
  }
});
