import React from 'react';
import RStudioSandboxCredentialsStore from '../../stores/RStudioSandboxCredentialsStore';
import ActionCreators from '../../ActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ExtendCredentialsButton from './ExtendCredentialsButton';

export default React.createClass({
  mixins: [createStoreMixin(RStudioSandboxCredentialsStore)],

  getStateFromStores: function() {
    return {
      credentials: RStudioSandboxCredentialsStore.getCredentials(),
      isLoaded: RStudioSandboxCredentialsStore.getIsLoaded(),
      isExtending: RStudioSandboxCredentialsStore.getPendingActions().get('extend', false),
      isDisabled: RStudioSandboxCredentialsStore.getPendingActions().size > 0
    };
  },

  render: function() {
    if (this.state.isLoaded) {
      return (
        <ExtendCredentialsButton
          isExtending={this.state.isExtending}
          onExtend={ActionCreators.extendRStudioSandboxCredentials}
          disabled={this.state.isDisabled}
        />
      );
    }
  }
});

