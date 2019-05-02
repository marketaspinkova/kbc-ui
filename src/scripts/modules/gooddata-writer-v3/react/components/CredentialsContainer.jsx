import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import Credentials from './Credentials';
import ProvisioningActions from '../../gooddataProvisioning/actions';
import ProvisioningStore from '../../gooddataProvisioning/store';

import ApplicationStore from '../../../../stores/ApplicationStore';

export default createReactClass({
  mixins: [createStoreMixin(ApplicationStore, ProvisioningStore)],

  propTypes: {
    value: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      backendUrl: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getStateFromStores() {
    const canCreateProdProject = !!ApplicationStore.getCurrentProject().getIn(['limits', 'goodData.prodTokenEnabled', 'value']);
    const {pid} = this.props.value;
    const data = ProvisioningStore.getData(pid);

    return {
      canCreateProdProject,
      data,
      canDisconnectProject: ApplicationStore.getKbcVars().get('canEditProjectLimits'),
      isCreating: ProvisioningStore.getIsCreating(),
      isLoading: ProvisioningStore.getIsLoading(pid),
      isDeleting: ProvisioningStore.getIsDeleting(pid)
    };
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
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
      return ProvisioningActions.createProject(name, tokenType, customToken).then(
        ({pid, login, password}) => {
          ProvisioningActions.loadNewProjectProvisioningData(pid);
          return this.props.onSave({pid, login, password});
        }
      );
    } else {
      const {pid, login, password, backendUrl} = newProject;
      return this.props.onSave({pid, login, password, backendUrl});
    }
  },

  resetConfigCredentials() {
    return this.props.onSave({pid: '', login: '', password: '', backendUrl: ''}).then( () =>
      this.props.onChange({pid: '', login: '', password: '', backendUrl: ''})
    );
  },

  handleResetProject(deleteProject) {
    const {pid} = this.props.value;
    if (deleteProject) {
      return ProvisioningActions.deleteProject(pid).then(this.resetConfigCredentials);
    } else {
      return this.resetConfigCredentials();
    }
  },

  render() {
    return (
      <Credentials
        disabled={this.props.disabled}
        config={this.props.value}
        provisioning={this.state}
        onHandleCreate={this.handleCreate}
        onHandleResetProject={this.handleResetProject}
        canDisconnectProject={this.state.canDisconnectProject}
      />
    );
  }

});
