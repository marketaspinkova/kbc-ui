import React from 'react';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import InstalledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import { loadProvisioningData } from '../../../gooddata-writer-v3/goodDataProvisioning/utils';

import GoodDataProvisioningActions from '../../../gooddata-writer-v3/goodDataProvisioning/actions';

const COMPONENT_ID = 'keboola.gooddata-writer';

export default React.createClass({
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    deleteConfigFn: React.PropTypes.func.isRequired,
    isDeletingConfig: React.PropTypes.bool.isRequired,
    renderWithCaption: React.PropTypes.bool
  },

  getInitialState() {
    return {
      showModal: false,
      isDeletingProject: false,
      loadingData: false,
      pid: null
    };
  },

  render() {
    const loader = this.isPending() && <Loader />;
    return this.props.renderWithCaption ? (
      <a onClick={this.handleDelete}>
        {this.renderConfirmModal()}
        {loader || <span className="kbc-icon-cup fa fa-fw" />}
        {' Move to Trash'}
      </a>
    ) : (
      <Tooltip tooltip="Move To Trash" placement="top">
        <Button bsStyle="link" onClick={this.handleDelete} disabled={!!loader}>
          {this.renderConfirmModal()}
          {loader || <i className="fa kbc-icon-cup" />}
        </Button>
      </Tooltip>
    );
  },

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    const { configId, deleteConfigFn } = this.props;
    const stopLoading = () => this.setState({ loadingData: false });
    this.setState({ loadingData: true });
    InstalledComponentsActions.loadComponentConfigData(COMPONENT_ID, configId)
      .then(() => {
        const configData = InstalledComponentsStore.getConfigData(COMPONENT_ID, configId);
        const pid = configData.getIn(['parameters', 'project', 'pid']);
        if (pid) {
          return loadProvisioningData(pid).then((data) => {
            if (data) {
              return this.showExtraConfirmModal(pid);
            } else {
              return deleteConfigFn();
            }
          });
        } else {
          return deleteConfigFn();
        }
      })
      .finally(stopLoading);
  },

  handleExtraConfirm() {
    const { pid } = this.state;
    this.setState({ isDeletingProject: true });
    return GoodDataProvisioningActions.deleteProject(pid)
      .then(() => {
        this.closeModal();
        return this.props.deleteConfigFn();
      })
      .finally(() => this.setState({ isDeletingProject: false }));
  },

  isPending() {
    return this.props.isDeletingConfig || this.state.loadingData || this.state.isDeletingProject;
  },

  renderConfirmModal() {
    const { pid } = this.state;
    return (
      <ConfirmModal
        show={this.state.showModal}
        onHide={this.closeModal}
        title="Delete GoodData project and move configuration to Trash"
        text={`This will also delete the GoodData project(${pid}). Delete the GoodData project and move the configuration to Trash?`}
        isLoading={this.state.isDeletingProject}
        onConfirm={() => this.handleExtraConfirm()}
        buttonLabel="Delete project and  move to Trash"
        buttonType="danger"
      />
    );
  },

  closeModal() {
    this.setState({ showModal: false, pid: null });
  },

  showExtraConfirmModal(pid) {
    this.setState({ showModal: true, pid });
  }
});
