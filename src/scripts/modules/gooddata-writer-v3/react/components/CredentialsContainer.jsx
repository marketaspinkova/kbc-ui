import React, {PropTypes} from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import Credentials from './Credentials';
import ProvisioningActions from '../../provisioning/actions';
import ProvisioningStore from '../../provisioning/store';

// import ProvisioningUtils, {ProvisioningStates, TokenTypes} from '../../provisioning/utils';
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
    const data = ProvisioningStore.getProvisioning(pid);

    return {
      canCreateProdProject,
      data,
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

  handleCreate(newProject) {
    if (newProject.isCreateNewProject) {
      const {name, tokenType, customToken} = newProject;
      return ProvisioningActions.createProject(name, tokenType, customToken).then( this.props.onSave);
    } else {
      const {pid, login, password} = newProject;
      return this.props.onSave({pid, login, password});
    }
  },

  render() {
    return (
      <Credentials
        disabled={this.props.disabled}
        config={this.props.value}
        provisioning={this.state}
        onHandleCreate={this.handleCreate}
      />
    );
  }

});
