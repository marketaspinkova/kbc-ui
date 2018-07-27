import React, {PropTypes} from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import Credentials from './Credentials';
import ProvisioningActions from '../../provisioning/actions';
import ProvisioningStore from '../../provisioning/store';

// import ProvisioningUtils, {ProvisioningStates, ActionTypes, TokenTypes} from '../../provisioning/utils';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default React.createClass({
  mixins: [createStoreMixin(ApplicationStore, ProvisioningStore)],

  propTypes: {
    value: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getStateFromStores() {
    const canCreateProdProject = !!ApplicationStore.getCurrentProject().getIn(['limits', 'goodData.prodTokenEnabled', 'value']);
    const {pid} = this.props.value;
    const provisioning = ProvisioningStore.getProvisioning(pid);

    return {
      canCreateProdProject,
      provisioning,
      isCreating: ProvisioningStore.getIsCreating(),
      isLoading: pid && ProvisioningStore.getIsLoading(pid)
    };
  },

  componentDidMount() {
    const {value} = this.props;
    const hasCredentials = value.pid && value.login && value.password;
    if (hasCredentials) {
      ProvisioningActions.loadProvisioningData(value.pid);
    }
  },

  render() {
    return (
      <Credentials
        {...this.props}
        provisioning={this.state}
      />
    );
  }

});
