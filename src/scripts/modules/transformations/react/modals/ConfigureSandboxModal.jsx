import React, {PropTypes} from 'react';
import {Modal} from 'react-bootstrap';
import {Link} from 'react-router';
import {RadioGroup} from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
import MySqlCredentialsContainer from '../components/MySqlCredentialsContainer';
import RedshiftCredentialsContainer from '../components/RedshiftCredentialsContainer';
import SnowflakeCredentialsContainer from '../components/SnowflakeCredentialsContainer';
import DockerCredentialsContainer from '../components/DockerCredentialsContainer';
import ConnectToMySqlSandbox from '../components/ConnectToMySqlSandbox';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import ExtendMySqlCredentials from '../../../provisioning/react/components/ExtendMySqlCredentials';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired,
    transformationType: PropTypes.string.isRequired,
    progress: PropTypes.string,
    progressStatus: PropTypes.string,
    isRunning: PropTypes.bool,
    isCreated: PropTypes.bool,
    jobId: PropTypes.string,
    mysqlCredentials: PropTypes.object.isRequired,
    redshiftCredentials: PropTypes.object.isRequired,
    snowflakeCredentials: PropTypes.object.isRequired,
    dockerCredentials: PropTypes.object.isRequired,
    isLoadingDockerCredentials: PropTypes.bool,
    onModeChange: PropTypes.func.isRequired,
    onCreateStart: PropTypes.func.isRequired
  },

  onHide() {
    this.props.onHide();
  },

  render() {
    return (
      <Modal show={this.props.show}
        bsSize={this.props.backend === 'docker' ? null : 'large'}
        onHide={this.onHide} enforceFocus={false}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Create sandbox</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.backend !== 'docker' &&
           <div>
             <h3>Mode</h3>
             <RadioGroup
               name="mode"
               selectedValue={this.props.mode}
               onChange={this.props.onModeChange}
             >
               <div className="form-horizontal">
                 <RadioGroupInput
                   label="Load input tables only"
                   wrapperClassName="col-sm-offset-1 col-sm-8"
                   value="input"
                 />
                 <RadioGroupInput
                   label="Prepare transformation"
                   help="Load input tables AND execute required transformations"
                   wrapperClassName="col-sm-offset-1 col-sm-8"
                   value="prepare"
                 />
                 <RadioGroupInput
                   label="Execute transformation without writing to Storage"
                   wrapperClassName="col-sm-offset-1 col-sm-8"
                   value="dry-run"
                 />
               </div>
               <div className="help-block">
                 Note: Disabled transformations will NOT be executed in any of these modes.
               </div>

             </RadioGroup>
           </div>
          }
          {this.renderCredentials()}
        </Modal.Body>
        <Modal.Footer>
          {(this.props.backend !== 'docker' || this.hasDockerCredentials() || this.props.isRunning || this.props.progressStatus === 'danger') &&
           <div className="pull-left" style={{padding: '6px 15px'}}>
             <span className={'text-' + this.props.progressStatus}>
               {this.renderStatusIcon()} {this.props.progress}
               <span />
               {' '}
               {this.props.jobId ? <Link to="jobDetail" params={{jobId: this.props.jobId}}>More details</Link> : null}
             </span>
           </div>
          }
          <ConfirmButtons
            onCancel={this.props.onHide}
            onSave={this.props.onCreateStart}
            saveLabel={'Create Sandbox'}
            cancelLabel={'Close'}
            isSaving={this.props.isRunning}
            showSave={this.showSave()}
            isDisabled={!this.hasCredentials()}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderStatusIcon() {
    if (this.props.progressStatus === 'success') {
      return (
        <span className="fa fa-check"/>
      );
    } else if (this.props.progressStatus === 'danger') {
      return (
        <span className="fa fa-times"/>
      );
    } else {
      return null;
    }
  },

  hasDockerCredentials() {
    return this.props.dockerCredentials.get('id');
  },

  showSave() {
    if (this.props.backend !== 'docker') return !this.props.isCreated;
    return !this.props.isLoadingDockerCredentials && !this.hasDockerCredentials();
  },

  hasCredentials() {
    if (this.props.backend === 'mysql') {
      return this.props.mysqlCredentials.has('id');
    } else if (this.props.backend === 'redshift') {
      return this.props.redshiftCredentials.has('id');
    } else if (this.props.backend === 'snowflake') {
      return this.props.snowflakeCredentials.has('id');
    } else {
      return true;
    }
  },

  renderCredentials() {
    const { backend } = this.props;

    if (backend === 'docker') {
      return (
        <div className="clearfix">
          {this.renderDockerCredentials()}
        </div>
      );
    }
    if (!['mysql', 'redshift', 'snowflake'].includes(backend)) {
      return null;
    }

    return (
      <div className="clearfix">
        <h3>Credentials</h3>
        <div className="col-sm-offset-1 col-sm-10">
          {backend === 'redshift' ? this.renderRedshiftCredentials() : null}
          {backend === 'mysql' ? this.renderMysqlCredentials() : null}
          {backend === 'snowflake' ? this.renderSnowflakeCredentials() : null}
        </div>
      </div>
    );
  },

  renderRedshiftCredentials() {
    return (<RedshiftCredentialsContainer isAutoLoad={true}/>);
  },

  renderDockerCredentials() {
    return (
      <DockerCredentialsContainer
        type={this.props.transformationType}
        isAutoLoad={true} />
    );
  },

  renderSnowflakeCredentials() {
    return (
      <div className="row">
        <div className="col-md-9">
          <SnowflakeCredentialsContainer isAutoLoad={true} />
        </div>
        <div className="col-md-3">
          {this.renderSnowflakeConnect()}
        </div>
      </div>
    );
  },

  renderSnowflakeConnect() {
    if (!this.props.snowflakeCredentials.get('id')) {
      return null;
    }
    return (
      <div>
        <ExternalLink href={'https://' + this.props.snowflakeCredentials.get('hostname') + '/console/login#/?returnUrl=sql/worksheet'} className="btn btn-link">
          <span className="fa fa-fw fa-database" />
          <span> Connect</span>
        </ExternalLink>
      </div>
    );
  },

  renderMysqlCredentials() {
    return (
      <div className="row">
        <div className="col-md-9">
          <MySqlCredentialsContainer isAutoLoad={true} />
        </div>
        <div className="col-md-3">
          {this.renderMysqlConnect()}
        </div>
      </div>
    );
  },

  renderMysqlConnect() {
    if (!this.props.mysqlCredentials.get('id')) {
      return null;
    }
    return (
      <span>
        <ConnectToMySqlSandbox credentials={this.props.mysqlCredentials}>
          <button className="btn btn-link" title="Connect to Sandbox" type="submit">
            <span className="fa fa-fw fa-database"/> Connect
          </button>
        </ConnectToMySqlSandbox>
        <ExtendMySqlCredentials />
      </span>
    );
  }
});
