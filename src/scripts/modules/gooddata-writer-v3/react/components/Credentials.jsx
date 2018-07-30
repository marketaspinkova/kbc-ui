import React, {PropTypes} from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';
import {isNewProjectValid, ProvisioningStates, TokenTypes} from '../../provisioning/utils';


export default React.createClass({
  propTypes: {
    provisioning: PropTypes.shape({
      isCreating: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
      canCreateProdProject: PropTypes.bool.isRequired,
      data: PropTypes.object
    }),
    config: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired
    }),
    disabled: PropTypes.bool.isRequired,
    onHandleCreate: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      showModal: false,
      newProject: {
        name: '',
        login: '',
        password: '',
        pid: '',
        customToken: '',
        isCreateNewProject: true,
        tokenType: TokenTypes.DEMO
      }
    };
  },

  openModal(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showModal: true});
  },

  closeModal() {
    if (!this.props.disabled) {
      this.setState(this.getInitialState());
    }
  },

  renderModal() {
    return (
      <Modal onHide={this.closeModal} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            Setup GoodData Project
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <NewProjectForm
            canCreateProdProject={this.props.provisioning.canCreateProdProject}
            value={this.state.newProject}
            onChange={val => this.setState({newProject: val})}
            disabled={this.props.disabled}
          />
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.disabled}
            isDisabled={!this.isValid()}
            saveLabel={this.state.newProject.isCreateNewProject ? 'Create' : 'Save'}
            onCancel={this.closeModal}
            onSave={this.handleCreate}/>
        </Modal.Footer>
      </Modal>
    );
  },

  render() {
    return (
      <div>
        {this.renderModal()}
        {this.renderTestSelect()}
        {this.renderByProvisioningState()}
      </div>
    );
  },


  renderTestSelect() {
    const states = Object.keys(ProvisioningStates);
    const data = {
      [ProvisioningStates.NONE]: {},
      [ProvisioningStates.OWN_CREDENTIALS]: {},
      [ProvisioningStates.KBC_NO_SSO]: {authToken: 'keboola_demo'},
      [ProvisioningStates.KBC_WITH_SSO]: {authToken: 'keboola_demo', link: 'https://www.example.com'},
      [ProvisioningStates.ERROR]: {error: 'There has been error'}
    };
    return (
      <div>
        <select onChange={e => this.setState({provisioning: {state: e.target.value, data}})}>
          {states.map(ps => <option key={ps} value={ps}>{ps}</option>)}
        </select>
      </div>
    );
  },

  renderByProvisioningState() {
    switch (this.state.provisioning.state) {
      case ProvisioningStates.NONE:
        return this.renderNoCredentials();
      case ProvisioningStates.OWN_CREDENTIALS:
        return this.renderOwnCredentials();
      case ProvisioningStates.KBC_NO_SSO:
        return this.renderKbcNoSSO();
      case ProvisioningStates.KBC_WITH_SSO:
        return this.renderKbcWithSSO();
      case ProvisioningStates.ERROR:
        return this.renderProvisioningError();
      default:
        return null;
    }
  },

  renderProvisioningError() {
    const {provisioning} = this.state;
    const {error} = provisioning;
    return (
      <div>
        There was an error {error}
      </div>
    );
  },

  renderKbcWithSSO() {
    const {pid} = this.props.config;
    const {provisioning} = this.state;
    const {authToken, link} = provisioning;
    return (
      <div>
        <div>Keboola Provisioned GoodData Project({pid}).</div>
        <div> Token: {authToken}</div>
        <a href={link} target="blank noopener noreferrer">
          Go To Project
        </a>
      </div>
    );
  },

  renderKbcNoSSO() {
    const {pid} = this.props.config;
    const {provisioning} = this.state;
    const {authToken} = provisioning;
    return (
      <div>
        <div>Keboola Provisioned GoodData Project({pid}).</div>
        <div> Token: {authToken}</div>
        <button>
          Enable Access
        </button>
      </div>
    );
  },

  renderOwnCredentials() {
    const {pid, login} = this.props.config;
    return (
      <div>
        <h4>The GoodDataProject is not provisioned by Keboola</h4>
        <div> Project: {pid}</div>
        <div> User: {login}</div>
      </div>
    );
  },

  renderNoCredentials() {
    return (
      <div className="component-empty-state text-center">
        <p>No project set up yet.</p>
        <button
          disabled={this.props.disabled}
          onClick={this.openModal}
          className="btn btn-success">
          Setup GoodData Project
        </button>
      </div>
    );
  },

  isValid() {
    return isNewProjectValid(this.state.newProject);
  },

  handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onHandleCreate(this.state.newProject).then(this.closeModal);
  }

});
