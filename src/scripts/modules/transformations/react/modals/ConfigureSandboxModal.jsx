import PropTypes from 'prop-types';
import React from 'react';
import { Modal, HelpBlock, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { RadioGroup } from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
import RedshiftCredentialsContainer from '../components/RedshiftCredentialsContainer';
import SnowflakeCredentialsContainer from '../components/SnowflakeCredentialsContainer';
import DockerCredentialsContainer from '../components/DockerCredentialsContainer';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import { ExternalLink } from '@keboola/indigo-ui';

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
      <Modal
        show={this.props.show}
        bsSize={this.props.backend === 'docker' ? null : 'large'}
        onHide={this.onHide}
        enforceFocus={false}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Create sandbox</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.backend !== 'docker' && (
            <div>
              <h2>Mode</h2>
              <HelpBlock>Disabled transformations will not be executed.</HelpBlock>

              <div className="row">
                <div className="col-sm-9">
                  <div className="form-horizontal">
                    <RadioGroup name="mode" selectedValue={this.props.mode} onChange={this.props.onModeChange}>
                      <RadioGroupInput
                        wrapperClassName="col-sm-offset-3 col-sm-9"
                        label="Load input tables only"
                        value="input"
                      />
                      <RadioGroupInput
                        wrapperClassName="col-sm-offset-3 col-sm-9"
                        label="Prepare transformation"
                        help="Load input tables AND execute required transformations"
                        value="prepare"
                      />
                      <RadioGroupInput
                        wrapperClassName="col-sm-offset-3 col-sm-9"
                        label="Execute transformation without writing to Storage"
                        value="dry-run"
                      />
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          )}
          {this.renderCredentials()}
        </Modal.Body>
        <Modal.Footer>
          {(this.props.backend !== 'docker' ||
            this.hasDockerCredentials() ||
            this.props.isRunning ||
            this.props.progressStatus === 'danger') && (
            <div className="pull-left" style={{ padding: '6px 15px' }}>
              <span className={'text-' + this.props.progressStatus}>
                {this.renderStatusIcon()} {this.props.progress}
                {this.props.jobId ? (
                  <Link to="jobDetail" params={{ jobId: this.props.jobId }} style={{ paddingLeft: '5px' }}>
                    More details
                  </Link>
                ) : null}
              </span>
            </div>
          )}
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
    switch (this.props.progressStatus) {
      case 'success':
        return <span className="fa fa-check" />;
      case 'danger':
        return <span className="fa fa-times" />;
      default:
        return null;
    }
  },

  hasDockerCredentials() {
    return this.props.dockerCredentials.get('id');
  },

  showSave() {
    if (this.props.backend !== 'docker') {
      return !this.props.isCreated;
    }
    return !this.props.isLoadingDockerCredentials && !this.hasDockerCredentials();
  },

  hasCredentials() {
    switch (this.props.backend) {
      case 'redshift':
        return this.props.redshiftCredentials.has('id');
      case 'snowflake':
        return this.props.snowflakeCredentials.has('id');
      default:
        return true;
    }
  },

  renderCredentials() {
    const { backend } = this.props;
    if (backend === 'docker') {
      return this.renderDockerCredentials();
    }
    if (!['redshift', 'snowflake'].includes(backend)) {
      return null;
    }

    return (
      <div>
        <h2>Credentials</h2>
        {backend === 'redshift' ? this.renderRedshiftCredentials() : null}
        {backend === 'snowflake' ? this.renderSnowflakeCredentials() : null}
      </div>
    );
  },

  renderRedshiftCredentials() {
    return (
      <Row>
        <Col sm={9}>
          <RedshiftCredentialsContainer isAutoLoad={true} />
        </Col>
      </Row>
    );
  },

  renderDockerCredentials() {
    return <DockerCredentialsContainer type={this.props.transformationType} isAutoLoad={true} />;
  },

  renderSnowflakeCredentials() {
    return (
      <Row>
        <Col sm={9}>
          <SnowflakeCredentialsContainer isAutoLoad={true} />
        </Col>
        <Col sm={3}>{this.renderSnowflakeConnect()}</Col>
      </Row>
    );
  },

  renderSnowflakeConnect() {
    if (!this.props.snowflakeCredentials.get('id')) {
      return null;
    }

    return (
      <div>
        <ExternalLink
          href={
            'https://' + this.props.snowflakeCredentials.get('hostname') + '/console/login#/?returnUrl=sql/worksheet'
          }
          className="btn btn-link"
        >
          <span className="fa fa-fw fa-database" />
          <span> Connect</span>
        </ExternalLink>
      </div>
    );
  }
});
