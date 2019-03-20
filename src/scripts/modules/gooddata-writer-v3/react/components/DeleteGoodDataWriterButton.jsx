import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Alert } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import { loadProvisioningData } from '../../../gooddata-writer-v3/gooddataProvisioning/utils';

import GoodDataProvisioningActions from '../../../gooddata-writer-v3/gooddataProvisioning/actions';

export default createReactClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    deleteConfigFn: PropTypes.func.isRequired,
    getConfigDataFn: PropTypes.func.isRequired,
    isDeletingConfig: PropTypes.bool.isRequired,
    renderWithCaption: PropTypes.bool
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
    const loader = this.isPending() && <Loader className="fa fa-fw" />;
    return this.props.renderWithCaption ? (
      <button onClick={this.handleDelete} className="btn btn-link btn-block">
        {this.renderConfirmModal()}
        {loader || <span className="kbc-icon-cup fa fa-fw" />}
        {' Move to Trash'}
      </button>
    ) : (
      <Tooltip tooltip="Move To Trash" placement="top">
        <Button bsStyle="link" onClick={this.handleDelete} disabled={!!loader}>
          {this.renderConfirmModal()}
          {loader || <i className="fa fa-fw kbc-icon-cup" />}
        </Button>
      </Tooltip>
    );
  },

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    const { deleteConfigFn } = this.props;
    const stopLoading = () => this.setState({ loadingData: false });
    this.setState({ loadingData: true });
    this.props
      .getConfigDataFn()
      .then((configData) => {
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
    return (
      <ConfirmModal
        show={this.state.showModal}
        onHide={this.closeModal}
        title="Move Configuration to Trash"
        text={(
          <div>
            <p>
              Are you sure you want to move the configuration
              {' '}<strong>{this.props.config.get('name')}</strong> to Trash?
            </p>
            <Alert bsStyle="warning">
              This will also delete the GoodData project (PID: <code>{this.state.pid}</code>).
            </Alert>
          </div>
        )}
        isLoading={this.state.isDeletingProject}
        onConfirm={() => this.handleExtraConfirm()}
        buttonLabel="Move to Trash"
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
