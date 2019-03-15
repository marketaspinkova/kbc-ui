import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ConfigureSandboxModal from './ConfigureSandboxModal';
// import ConfigureDockerSandboxModal from './ConfigureDockerSandboxModal';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RedshiftSandboxCredentialsStore from '../../../provisioning/stores/RedshiftSandboxCredentialsStore';
import SnowflakeSandboxCredentialsStore from '../../../provisioning/stores/SnowflakeSandboxCredentialsStore';
import JupyterSandboxCredentialsStore from '../../../provisioning/stores/JupyterSandboxCredentialsStore';
import RStudioSandboxCredentialsStore from '../../../provisioning/stores/RStudioSandboxCredentialsStore';
import jobsApi from '../../../jobs/JobsApi';
import actionCreators from '../../../components/InstalledComponentsActionCreators';
import provisioningActions from '../../../provisioning/ActionCreators';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    defaultMode: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired,
    transformationType: PropTypes.string.isRequired,
    runParams: PropTypes.object.isRequired
  },
  mixins: [createStoreMixin(RedshiftSandboxCredentialsStore, SnowflakeSandboxCredentialsStore, JupyterSandboxCredentialsStore, RStudioSandboxCredentialsStore)],

  getStateFromStores() {
    const isPythonTransformation = this.isPythonTransformation();
    const dockerStore = isPythonTransformation ? JupyterSandboxCredentialsStore : RStudioSandboxCredentialsStore;
    return {
      redshiftCredentials: RedshiftSandboxCredentialsStore.getCredentials(),
      snowflakeCredentials: SnowflakeSandboxCredentialsStore.getCredentials(),
      dockerCredentials: dockerStore.getCredentials(),
      isLoadingDockerCredentials: dockerStore.getIsLoading()
    };
  },

  getInitialState() {
    return {
      mode: this.props.defaultMode,
      isRunning: false,
      jobId: null,
      progress: null,
      progressStatus: null,
      isCreated: false
    };
  },

  componentWillUnmount() {
    this.cancellablePromiseRunComponent && this.cancellablePromiseRunComponent.cancel();
    this.cancellablePromiseJobDetail && this.cancellablePromiseJobDetail.cancel();
  },

  render() {
    return (
      <ConfigureSandboxModal
        redshiftCredentials={this.state.redshiftCredentials}
        dockerCredentials={this.state.dockerCredentials}
        isLoadingDockerCredentials={this.state.isLoadingDockerCredentials}
        snowflakeCredentials={this.state.snowflakeCredentials}
        onHide={this.handleModalClose}
        show={this.props.show}
        backend={this.props.backend}
        transformationType={this.props.transformationType}
        mode={this.state.mode}
        jobId={this.state.jobId}
        progress={this.state.progress}
        progressStatus={this.state.progressStatus}
        isRunning={this.state.isRunning}
        isCreated={this.state.isCreated}
        onModeChange={this.handleModeChange}
        onCreateStart={this.props.backend === 'docker' ? this.handleDockerSandboxCreate : this.handleSandboxCreate}
      />
    );
  },

  handleModeChange(mode) {
    this.setState({mode});
  },

  isPythonTransformation() {
    return this.props.transformationType === 'python' && this.props.backend === 'docker';
  },

  handleDockerSandboxCreate() {
    this.setState({
      isRunning: true,
      jobId: null,
      progress: 'Creating sandbox and loading data.',
      progressStatus: null
    });
    const createCredentialsAction = this.isPythonTransformation() ? provisioningActions.createJupyterSandboxCredentials : provisioningActions.createRStudioSandboxCredentials;
    const createSandboxPromise = createCredentialsAction(this.props.runParams.toJS(), {source: 'transformation'});
    return createSandboxPromise.then(() =>
      this.setState({
        isRunning: false,
        progress: 'Sandbox is successfully created and all data are loaded. You can start using it now!',
        progressStatus: 'success',
        jobId: null,
        isCreated: true
      }),
    (errorJob) =>
      this.setState({
        isRunning: false,
        progress: 'Load finished with an error. ',
        jobId: errorJob.id,
        progressStatus: 'danger',
        isCreated: true
      })
    ).catch((error) => {
      this.setState({
        isRunning: false,
        progress: 'Load finished with an error.',
        progressStatus: 'danger',
        isCreated: true
      });
      throw error;
    });
  },

  handleSandboxCreate() {
    this.setState({
      isRunning: true,
      jobId: null,
      progress: 'Waiting for load to start.',
      progressStatus: null
    });

    this.cancellablePromiseRunComponent = actionCreators.runComponent({
      component: 'transformation',
      notify: false,
      data: this.props.runParams.set('mode', this.state.mode).toJS()
    }).then(this.handleJobReceive).catch((e) => {
      this.setState({
        isRunning: false
      });
      throw e;
    });
  },

  handleJobReceive(job) {
    if (job.isFinished) {
      if (job.status === 'success') {
        this.setState({
          isRunning: false,
          progress: 'Sandbox is successfully loaded. You can start using it now.',
          progressStatus: 'success',
          jobId: null,
          isCreated: true
        });
      } else {
        this.setState({
          isRunning: false,
          progress: 'Load finished with an error.',
          progressStatus: 'danger',
          jobId: job.id,
          isCreated: true
        });
      }
    } else {
      this.setState({
        jobId: job.id,
        progress: job.state === 'waiting' ? 'Waiting for load to start.' : 'Loading data into sandbox.'
      });
      setTimeout(this.checkJobStatus, 5000);
    }
  },

  checkJobStatus() {
    if (!this.state.jobId) {
      return;
    }

    this.cancellablePromiseJobDetail = jobsApi
      .getJobDetail(this.state.jobId)
      .then(this.handleJobReceive)
      .catch((e) => {
        this.setState({
          isRunning: false
        });
        throw e;
      });
  },

  handleModalClose() {
    // reset state
    this.setState(this.getInitialState());
    this.props.onHide();
  }
});
