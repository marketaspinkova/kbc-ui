import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RedshiftSandboxCredentialsStore from '../../../provisioning/stores/RedshiftSandboxCredentialsStore';
import RedshiftCredentials from '../../../provisioning/react/components/RedshiftCredentials';
import CredentialsActionCreators from '../../../provisioning/ActionCreators';

export default createReactClass({
  propTypes: {
    isAutoLoad: PropTypes.bool.isRequired
  },

  mixins: [createStoreMixin(RedshiftSandboxCredentialsStore)],

  componentDidMount() {
    if (!this.state.credentials.get('id') && this.props.isAutoLoad) {
      CredentialsActionCreators.createRedshiftSandboxCredentials();
    }
  },

  getStateFromStores() {
    return {
      credentials: RedshiftSandboxCredentialsStore.getCredentials(),
      pendingActions: RedshiftSandboxCredentialsStore.getPendingActions(),
      isLoading: RedshiftSandboxCredentialsStore.getIsLoading(),
      isLoaded: RedshiftSandboxCredentialsStore.getIsLoaded()
    };
  },

  render() {
    return (
      <RedshiftCredentials credentials={this.state.credentials} isCreating={this.state.pendingActions.get('create')} />
    );
  }
});
