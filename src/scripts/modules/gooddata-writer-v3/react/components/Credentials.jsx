import React, {PropTypes} from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewProjectForm from './NewProjectForm';
import ProvisioningUtils, {ProvisioningStates, ActionTypes, TokenTypes} from '../../provisioning/utils';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      provisioning: PropTypes.object.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showModal: false,
      canCreateProdProject: !!ApplicationStore.getCurrentProject().getIn(['limits', 'goodData.prodTokenEnabled', 'value']),
      newProject: {
        action: ActionTypes.CREATE,
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
            canCreateProdProject={this.state.canCreateProdProject}
            value={this.state.newProject}
            onChange={val => this.setState({newProject: val})}
            disabled={this.props.disabled}
          />
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.disabled}
            isDisabled={!this.isValid()}
            saveLabel={this.state.newProject.action === ActionTypes.CREATE ? 'Create' : 'Save'}
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

  renderByProvisioningState() {
    switch (this.props.value.provisioning.state) {
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
    const {provisioning} = this.props.value;
    const {error} = provisioning;
    return (
      <div>
        There was an error {error}
      </div>
    );
  },

  renderKbcWithSSO() {
    const {provisioning, pid} = this.props.value;
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
    const {provisioning, pid} = this.props.value;
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
    const {pid, login} = this.props.value;
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
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
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
    return ProvisioningUtils.isNewProjectValid(this.state.newProject);
  },

  handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    ProvisioningUtils.prepareProject(this.state.newProject).then( projectToSave =>
      this.props.onSave(projectToSave).then(this.closeModal)
    );
  }

});
